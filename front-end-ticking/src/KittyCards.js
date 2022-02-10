import React from 'react'
import {
  Button,
  Card,
  Grid,
  Message,
  Modal,
  Form,
  Label,
} from 'semantic-ui-react'
import KittyAvatar from './KittyAvatar'
import { TxButton } from './substrate-lib/components'

const TransferModal = props => {
  const { kitty, accountPair, setStatus } = props
  const [open, setOpen] = React.useState(false)
  const [formValue, setFormValue] = React.useState({})
  const formChange = key => (ev, el) => {
    setFormValue({ ...formValue, [key]: el.value })
  }

  const confirmAndClose = unsub => {
    unsub()
    setOpen(false)
  }
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button basic color="blue">
          Transfer
        </Button>
      }
    >
      {/* The title of the modal */}
      <Modal.Header>Kitty Transfer</Modal.Header>
      <Modal.Content>
        <Form>
          {/* The modal's inputs fields */}
          <Form.Input fluid label="Kitty ID" readOnly value={kitty.id} />
          <Form.Input
            fluid
            label="Receiver"
            placeholder="Receiver Address"
            onChange={formChange('target')}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {/* The cancel button */}
        <Button basic color="grey" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {/* The TxButton component */}
        <TxButton
          accountPair={accountPair}
          label="Transfer"
          type="SIGNED-TX"
          setStatus={setStatus}
          onClick={confirmAndClose}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'transfer',
            inputParams: [formValue.target, kitty.id],
            paramFields: [true, true],
          }}
        />
      </Modal.Actions>
    </Modal>
  )
}

const SetPriceModal = props => {
  const { kitty, accountPair, setStatus } = props
  const [open, setOpen] = React.useState(false)
  const [formValue, setFormValue] = React.useState({})
  const formChange = key => (ev, el) => {
    setFormValue({ ...formValue, [key]: el.value })
  }

  const confirmAndClose = unsub => {
    unsub()
    setOpen(false)
  }
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button basic color="blue">
          Set Price
        </Button>
      }
    >
      {/* The title of the modal */}
      <Modal.Header>Set Kitty Price</Modal.Header>
      <Modal.Content>
        <Form>
          {/* The modal's inputs fields */}
          <Form.Input fluid label="Kitty ID" readOnly value={kitty.id} />
          <Form.Input
            fluid
            label="Price"
            placeholder="Kitty Sell Price"
            onChange={formChange('target')}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {/* The cancel button */}
        <Button basic color="grey" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {/* The TxButton component */}
        <TxButton
          accountPair={accountPair}
          label="SetPrice"
          type="SIGNED-TX"
          setStatus={setStatus}
          onClick={confirmAndClose}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'setPrice',
            inputParams: [kitty.id, formValue.target],
            paramFields: [true, true],
          }}
        />
      </Modal.Actions>
    </Modal>
  )
}

const BuyModal = props => {
  const { kitty, accountPair, setStatus } = props
  const [open, setOpen] = React.useState(false)

  const confirmAndClose = unsub => {
    unsub()
    setOpen(false)
  }
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button basic color="blue">
          Buy Kitty
        </Button>
      }
    >
      {/* The title of the modal */}
      <Modal.Header>Buy Kitty</Modal.Header>
      <Modal.Content>
        <p>Are you sure you want to buy this kitty for {kitty.price}?</p>
      </Modal.Content>
      <Modal.Actions>
        {/* The cancel button */}
        <Button basic color="grey" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {/* The TxButton component */}
        <TxButton
          accountPair={accountPair}
          label="Buy"
          type="SIGNED-TX"
          setStatus={setStatus}
          onClick={confirmAndClose}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'buyKitty',
            inputParams: [kitty.id, kitty.price],
            paramFields: [true, true],
          }}
        />
      </Modal.Actions>
    </Modal>
  )
}

const BreedModal = props => {
  const { kitty, accountPair, setStatus } = props
  const [open, setOpen] = React.useState(false)
  const [formValue, setFormValue] = React.useState({})
  const formChange = key => (ev, el) => {
    setFormValue({ ...formValue, [key]: el.value })
  }

  const confirmAndClose = unsub => {
    unsub()
    setOpen(false)
  }
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button basic color="blue">
          Breed Kitties
        </Button>
      }
    >
      {/* The title of the modal */}
      <Modal.Header>Breed Kitties</Modal.Header>
      <Modal.Content>
        <Form>
          {/* The modal's inputs fields */}
          <Form.Input fluid label="Kitty-1 ID" readOnly value={kitty.id} />
          <Form.Input
            fluid
            label="Kitty-2 ID"
            placeholder=""
            onChange={formChange('target')}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {/* The cancel button */}
        <Button basic color="grey" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {/* The TxButton component */}
        <TxButton
          accountPair={accountPair}
          label="BreedKitty"
          type="SIGNED-TX"
          setStatus={setStatus}
          onClick={confirmAndClose}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'breedKitty',
            inputParams: [kitty.id, formValue.target],
            paramFields: [true, true],
          }}
        />
      </Modal.Actions>
    </Modal>
  )
}

// Use props
const KittyCard = props => {
  const { kitty, accountPair, setStatus } = props
  const {
    id = null,
    dna = null,
    owner = null,
    gender = null,
    price = null,
  } = kitty
  const displayDna = dna && dna.toJSON()
  const isSelf = accountPair.address === kitty.owner

  return (
    <Card>
      {isSelf && (
        <Label as="a" floating color="teal">
          Mine
        </Label>
      )}
      {/* Render the Kitty Avatar */}
      <KittyAvatar dna={dna.toU8a()} />
      <Card.Content>
        {/* Display the Kitty ID */}
        <Card.Header style={{ fontSize: '1em', overflowWrap: 'break-word' }}>
          ID: {id}
        </Card.Header>
        {/* Display the Kitty DNA */}
        <Card.Meta style={{ fontSize: '.9em', overflowWrap: 'break-word' }}>
          DNA: {displayDna}
        </Card.Meta>
        {/* Display the Kitty ID, Gender, Owner and Price */}
        <Card.Description>
          <p style={{ overflowWrap: 'break-word' }}>Gender: {gender}</p>
          <p style={{ overflowWrap: 'break-word' }}>Owner: {owner}</p>
          <p style={{ overflowWrap: 'break-word' }}>Price: {price}</p>
        </Card.Description>
      </Card.Content>
      {/* Render the transfer button using TransferModal */}
      <Card.Content extra style={{ textAlign: 'center' }}>
        {owner === accountPair.address ? (
          <>
            <TransferModal
              kitty={kitty}
              accountPair={accountPair}
              setStatus={setStatus}
            />
            <SetPriceModal
              kitty={kitty}
              accountPair={accountPair}
              setStatus={setStatus}
            />
            <BreedModal
              kitty={kitty}
              accountPair={accountPair}
              setStatus={setStatus}
            />
          </>
        ) : (
          <>
            {price !== null ? (
              <BuyModal
                kitty={kitty}
                accountPair={accountPair}
                setStatus={setStatus}
              />
            ) : (
              ''
            )}
          </>
        )}
      </Card.Content>
    </Card>
  )
}

const KittyCards = props => {
  const { kitties, accountPair, setStatus } = props

  {
    /* Check the number of Kitties */
  }
  if (kitties.length === 0) {
    return (
      <Message info>
        <Message.Header>
          No Kitty found here... Create one now!&nbsp;
          <span role="img" aria-label="point-down">
            👇
          </span>
        </Message.Header>
      </Message>
    )
  }
  {
    /* Render Kitties using Kitty Card in a grid */
  }
  return (
    <Grid columns={3}>
      {kitties.map((kitty, i) => (
        <Grid.Column key={`kitty-${i}`}>
          <KittyCard
            kitty={kitty}
            accountPair={accountPair}
            setStatus={setStatus}
          />
        </Grid.Column>
      ))}
    </Grid>
  )
}

export default KittyCards
