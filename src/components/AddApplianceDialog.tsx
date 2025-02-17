import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

export default function AddApplianceDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Add Appliances</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={{ background: 'rgba(0, 0, 0, 0.5)' }} />
        <Dialog.Content aria-describedby="add-appliance-description" style={{ padding: '20px', background: 'white', borderRadius: '4px' }}>
          <Dialog.Title>Add Appliance</Dialog.Title>
          <Dialog.Description id="add-appliance-description">
            Fill out the form below to add a new appliance.
          </Dialog.Description>
          {/* Insert your form elements here */}
          <Dialog.Close style={{ marginTop: '10px' }}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 