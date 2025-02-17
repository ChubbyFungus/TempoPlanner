import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample model URLs (using sample models from Google's Sample Assets)
const SAMPLE_MODELS = {
  'sub-zero': 'https://storage.googleapis.com/sample-assets/appliances/refrigerator_01.glb',
  'thermador': 'https://storage.googleapis.com/sample-assets/appliances/refrigerator_02.glb',
  'liebherr': 'https://storage.googleapis.com/sample-assets/appliances/refrigerator_03.glb',
  'viking': 'https://storage.googleapis.com/sample-assets/appliances/refrigerator_04.glb',
  'miele': 'https://storage.googleapis.com/sample-assets/appliances/refrigerator_05.glb',
  'default': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
};

// Instructions for getting official models
const OFFICIAL_MODEL_SOURCES = {
  'sub-zero': {
    website: 'https://www.subzero-wolf.com/trade-resources',
    contact: 'trade@subzero.com',
    notes: 'Requires trade account. Contact regional distributor.'
  },
  'thermador': {
    website: 'https://www.thermador.com/us/trade-resources',
    contact: 'thermador-design-team@bshg.com',
    notes: 'Available through BSH Trade Resources.'
  },
  'liebherr': {
    website: 'https://home.liebherr.com/en/usa/products/planning-resources/planning-resources.html',
    contact: 'info.lhi@liebherr.com',
    notes: 'Contact for BIM/CAD resources.'
  },
  'viking': {
    website: 'https://www.vikingrange.com/consumer/category/trade-resources',
    contact: 'specifications@vikingrange.com',
    notes: 'Available through trade portal.'
  },
  'miele': {
    website: 'https://www.mieleusa.com/professional/architect-and-designer-resources-11367.htm',
    contact: 'proinfo@mieleusa.com',
    notes: 'Requires professional account.'
  }
};

async function downloadModel(url, brand, quality) {
  const dir = path.join(__dirname, '../public/models/appliances/refrigerators', brand);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `${quality}.glb`;
  const filepath = path.join(dir, filename);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${brand}/${filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

function generateModelRequestTemplate(brand) {
  const info = OFFICIAL_MODEL_SOURCES[brand];
  return `
Request Template for ${brand.toUpperCase()} 3D Models

Website: ${info.website}
Contact: ${info.contact}

Subject: Request for Professional 3D Model Files - [Your Company Name]

Dear ${brand.charAt(0).toUpperCase() + brand.slice(1)} Team,

I am writing to request access to the 3D model files for your refrigeration products. We are [Your Company Name], and we are developing [Brief Project Description].

Specifically, we are looking for:
1. High-quality GLB/GLTF format 3D models of your refrigeration line
2. Models with proper materials and textures
3. If possible, multiple LOD (Level of Detail) versions

Our intended use:
[Describe your specific use case]

We understand these are proprietary assets and will comply with all usage guidelines and restrictions.

Additional Information:
- Company Name: [Your Company]
- Contact Person: [Your Name]
- Role: [Your Role]
- Phone: [Your Phone]
- Email: [Your Email]
- Project Description: [Brief Description]

${info.notes}

Thank you for your assistance.

Best regards,
[Your Name]
[Your Company]
`;
}

async function main() {
  try {
    // Create templates directory
    const templatesDir = path.join(__dirname, '../docs/model-requests');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Generate request templates for each brand
    for (const brand of Object.keys(OFFICIAL_MODEL_SOURCES)) {
      const template = generateModelRequestTemplate(brand);
      fs.writeFileSync(
        path.join(templatesDir, `${brand}-request-template.txt`),
        template
      );
      console.log(`Generated request template for ${brand}`);
    }

    // Download default model first
    console.log('Downloading default model...');
    await downloadModel(SAMPLE_MODELS.default, 'default', 'high');
    console.log('Successfully downloaded default model');

    // Copy default model to each brand's directory with different LOD levels
    const defaultModelPath = path.join(__dirname, '../public/models/appliances/refrigerators/default/high.glb');
    const qualities = ['high', 'medium', 'low'];

    for (const brand of Object.keys(OFFICIAL_MODEL_SOURCES)) {
      console.log(`Setting up placeholder models for ${brand}...`);
      const brandDir = path.join(__dirname, '../public/models/appliances/refrigerators', brand);
      
      if (!fs.existsSync(brandDir)) {
        fs.mkdirSync(brandDir, { recursive: true });
      }

      for (const quality of qualities) {
        const targetPath = path.join(brandDir, `${quality}.glb`);
        fs.copyFileSync(defaultModelPath, targetPath);
        console.log(`Created ${quality} quality placeholder for ${brand}`);
      }
    }

    console.log('\nNext steps:');
    console.log('1. Review the generated request templates in docs/model-requests/');
    console.log('2. Customize each template with your company information');
    console.log('3. Submit requests through the appropriate channels');
    console.log('4. While waiting for responses, use the downloaded sample models for development');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 