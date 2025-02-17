import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOD_LEVELS = ['high', 'medium', 'low'];
const BRANDS = ['sub-zero', 'thermador', 'liebherr', 'viking', 'miele'];

// Version tracking for models
const MODEL_VERSION = '1.0.0';
const MODEL_MANIFEST_FILE = path.join(__dirname, '../public/models/manifest.json');

// Base URLs for different quality models
const MODEL_URLS = {
  'sub-zero': {
    high: 'https://storage.yourdomain.com/models/refrigerators/sub-zero/v1/high.glb',
    medium: 'https://storage.yourdomain.com/models/refrigerators/sub-zero/v1/medium.glb',
    low: 'https://storage.yourdomain.com/models/refrigerators/sub-zero/v1/low.glb'
  },
  'thermador': {
    high: 'https://storage.yourdomain.com/models/refrigerators/thermador/v1/high.glb',
    medium: 'https://storage.yourdomain.com/models/refrigerators/thermador/v1/medium.glb',
    low: 'https://storage.yourdomain.com/models/refrigerators/thermador/v1/low.glb'
  },
  'liebherr': {
    high: 'https://storage.yourdomain.com/models/refrigerators/liebherr/v1/high.glb',
    medium: 'https://storage.yourdomain.com/models/refrigerators/liebherr/v1/medium.glb',
    low: 'https://storage.yourdomain.com/models/refrigerators/liebherr/v1/low.glb'
  },
  'viking': {
    high: 'https://storage.yourdomain.com/models/refrigerators/viking/v1/high.glb',
    medium: 'https://storage.yourdomain.com/models/refrigerators/viking/v1/medium.glb',
    low: 'https://storage.yourdomain.com/models/refrigerators/viking/v1/low.glb'
  },
  'miele': {
    high: 'https://storage.yourdomain.com/models/refrigerators/miele/v1/high.glb',
    medium: 'https://storage.yourdomain.com/models/refrigerators/miele/v1/medium.glb',
    low: 'https://storage.yourdomain.com/models/refrigerators/miele/v1/low.glb'
  },
  'default': {
    high: 'https://storage.yourdomain.com/models/refrigerators/default/v1/high.glb',
    medium: 'https://storage.yourdomain.com/models/refrigerators/default/v1/medium.glb',
    low: 'https://storage.yourdomain.com/models/refrigerators/default/v1/low.glb'
  }
};

// Validate GLB file
const validateGLBFile = (buffer) => {
  // Check magic bytes for GLB
  const magic = buffer.toString('ascii', 0, 4);
  if (magic !== 'glTF') {
    throw new Error('Invalid GLB file: Incorrect magic bytes');
  }

  // Check version
  const version = buffer.readUInt32LE(4);
  if (version !== 2) {
    throw new Error(`Invalid GLB file: Unsupported version ${version}`);
  }

  // Check file length
  const length = buffer.readUInt32LE(8);
  if (buffer.length !== length) {
    throw new Error('Invalid GLB file: File length mismatch');
  }

  return true;
};

const downloadFile = (url, brand, quality) => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '../public/models/appliances/refrigerators', brand);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${quality}.glb`;
    const filepath = path.join(dir, filename);
    const tempFilepath = `${filepath}.temp`;

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        try {
          // Validate the GLB file
          validateGLBFile(buffer);
          
          // Write to temp file first
          fs.writeFileSync(tempFilepath, buffer);
          
          // Rename temp file to final filename
          fs.renameSync(tempFilepath, filepath);
          
          console.log(`Downloaded and validated ${brand}/${filename}`);
          resolve();
        } catch (error) {
          // Clean up temp file if it exists
          if (fs.existsSync(tempFilepath)) {
            fs.unlinkSync(tempFilepath);
          }
          reject(error);
        }
      });
    }).on('error', (err) => {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFilepath)) {
        fs.unlinkSync(tempFilepath);
      }
      reject(err);
    });
  });
};

const updateManifest = () => {
  const manifest = {
    version: MODEL_VERSION,
    lastUpdated: new Date().toISOString(),
    models: {}
  };

  // Add information for each brand and quality level
  for (const brand of [...BRANDS, 'default']) {
    manifest.models[brand] = {};
    for (const quality of LOD_LEVELS) {
      const filepath = path.join(__dirname, '../public/models/appliances/refrigerators', brand, `${quality}.glb`);
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        manifest.models[brand][quality] = {
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          path: `models/appliances/refrigerators/${brand}/${quality}.glb`
        };
      }
    }
  }

  fs.writeFileSync(MODEL_MANIFEST_FILE, JSON.stringify(manifest, null, 2));
};

async function downloadModels() {
  try {
    console.log('Starting model download process...');
    
    // Create models directory if it doesn't exist
    const modelsDir = path.join(__dirname, '../public/models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // Download models for each brand
    for (const brand of [...BRANDS, 'default']) {
      console.log(`Downloading models for ${brand}...`);
      for (const quality of LOD_LEVELS) {
        try {
          await downloadFile(MODEL_URLS[brand][quality], brand, quality);
        } catch (error) {
          console.error(`Error downloading ${brand}/${quality}.glb:`, error.message);
          // Continue with other downloads even if one fails
        }
      }
    }

    // Update the manifest file
    updateManifest();
    
    console.log('Model download process completed');
    console.log('Manifest updated at:', MODEL_MANIFEST_FILE);
  } catch (error) {
    console.error('Fatal error during model download:', error);
    process.exit(1);
  }
}

downloadModels(); 