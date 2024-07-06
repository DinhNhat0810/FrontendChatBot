import { Button, Modal, TextField, Typography } from '@mui/material'
import { Box } from 'mdi-material-ui'
import React from 'react'

export default function SettingsGroupModal({
  openModal = false,
  setOpenModal,
  style,
  title,
  formData,
  setFormData,
  botData,
  selectedBot
}) {
  return (
    <Modal
      open={openModal}
      onClose={() => setOpenModal(false)}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Typography id='modal-modal-title' variant='h6' component='h2'>
          {title}
        </Typography>
        <Typography id='modal-modal-description' sx={{ mt: 2 }}>
          <TextField
            autoFocus
            id='outlined-basic'
            label='Tên Nhóm'
            variant='outlined'
            fullWidth
            sx={{ mt: 10 }}
            onChange={e => {
              setFormData({
                ...formData,
                name: e.target.value
              })
            }}
          />
          <TextField
            autoFocus
            id='outlined-basic'
            label='Id Nhóm'
            variant='outlined'
            fullWidth
            sx={{ mt: 10 }}
            onChange={e => {
              setFormData({
                ...formData,
                groupId: e.target.value
              })
            }}
          />
          <TextField
            autoFocus
            id='outlined-basic'
            label='Tên bot'
            disabled
            variant='outlined'
            fullWidth
            sx={{ mt: 10 }}
            value={botData?.name}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Button
              variant='contained'
              sx={{ mt: 10, backgroundColor: 'blue', color: 'white', cursor: 'pointer' }}
              onClick={() => {
                handleAddGroup(formData.groupId, selectedBot)
              }}
            >
              Xác nhận
            </Button>
            <Button
              variant='contained'
              sx={{ mt: 10, backgroundColor: 'red', color: 'white', cursor: 'pointer' }}
              onClick={() => {
                setOpenModal(false)
              }}
            >
              Đóng
            </Button>
          </div>
        </Typography>
      </Box>
    </Modal>
  )
}
