import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

export default function CatalogDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open Catalog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={{ background: 'rgba(0, 0, 0, 0.5)' }} />
        <Dialog.Content aria-describedby="catalog-dialog-description" style={{ padding: '20px', background: 'white', borderRadius: '4px' }}>
          <Dialog.Title>Catalog</Dialog.Title>
          <Dialog.Description asChild>
            <p id="catalog-dialog-description">This dialog displays catalog details for accessibility.</p>
          </Dialog.Description>
          <Dialog.Close style={{ marginTop: '10px' }}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 