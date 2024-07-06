'use client'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import { Alert, Button, Modal, Snackbar, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import SendOutline from 'mdi-material-ui/SendOutline'
import { sendMessages } from 'src/apiRequests/sendMessages'
import { ApplicationSettingsOutline, ClipboardTextPlay, Delete, PlaylistEdit } from 'mdi-material-ui'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { url } from 'src/utils/constant'

const rows = [
  {
    name: 'Jiwonie',
    token: '7384960745:AAFCq3KUCvVSzgG5BJGBBpg79r9NpIKc8P8'
  }
]

const statusObj = {
  applied: { color: 'info' },
  inactive: { color: 'error' },
  current: { color: 'primary' },
  resigned: { color: 'warning' },
  active: { color: 'success' }
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4
}

const BotTable = () => {
  const [formData, setFormData] = useState({
    token: '',
    name: '',
    _id: ''
  })
  const [message, setMessage] = useState('')

  const [messageType, setMessageType] = useState('success')
  const [notification, setNotification] = useState('')

  const [age, setAge] = useState('')

  const [bots, setBots] = useState([])

  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  const [modalType, setModalType] = useState('')

  const handleOpen = () => setOpen(true)

  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({
      name: '',
      token: '',
      _id: ''
    })
  }

  const handleChange = event => {
    setAge(event.target.value)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const handleSendMessage = async values => {
    try {
      const data = await sendMessages({
        groupId: values.groupId,
        message: values.message,
        token: values.token
      })
      if (data.status === 200) {
        setMessage('')
        setMessageType('success')
        setNotification('Message sent successfully')
        setOpen(true)
      }
    } catch (error) {
      console.error(error)
      setMessageType('error')
      setNotification('Error sending message')
    }
  }

  const fetchData = async () => {
    const data = await fetch(`${url}/api/bots`)
    const bots = await data.json()
    setBots(bots.payload)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async id => {
    try {
      const data = await fetch(`${url}/api/bots/delete/${id}`, {
        method: 'DELETE'
      })
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddBot = async () => {
    try {
      const data = await fetch(`${url}/api/bots/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          token: formData.token
        })
      })

      const response = await data.json()

      if (data.status === 201) {
        fetchData()
        setFormData({
          name: '',
          token: '',
          _id: ''
        })
        setOpenModal(false)
        setMessageType('success')
        setNotification('Tạo bot thành công')
        setOpen(true)
      }

      if (response.status === 'error') {
        setMessageType('error')
        setNotification(response.message)
        setOpen(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditBot = async () => {
    try {
      const data = await fetch(`${url}/api/bots/update/` + formData?._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          token: formData.token
        })
      })

      const response = await data.json()

      if (data.status === 201) {
        fetchData()
        setFormData({
          name: '',
          token: '',
          _id: ''
        })
        setOpenModal(false)
        setMessageType('success')
        setNotification('Cập nhật thành công')
        setOpen(true)
      }

      if (response.status === 'error') {
        setMessageType('error')
        setNotification(response.message)
        setOpen(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <h2 style={{}}>Danh sách bot</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            onClick={() => {
              setOpenModal(true)
              setModalType('add')
            }}
          >
            Thêm Bot
          </Button>
        </div>
      </div>
      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>Tên Bot</TableCell>
                <TableCell>Token</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bots?.length > 0 &&
                bots?.map(row => (
                  <TableRow hover key={row?.name} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.name}</Typography>
                        <Typography variant='caption'>{row.designation}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {row?.token}{' '}
                        <ClipboardTextPlay
                          onClick={() => {
                            navigator.clipboard.writeText(row?.token)
                            setMessageType('success')
                            setNotification('Copied to clipboard')
                            setOpen(true)
                          }}
                          sx={{
                            cursor: 'pointer',
                            fontSize: '18px',
                            marginLeft: '10px'
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlaylistEdit
                        onClick={() => {
                          setOpenModal(true)
                          setModalType('edit')
                          setFormData({
                            name: row.name,
                            token: row.token,
                            _id: row._id
                          })
                        }}
                        style={{ color: 'blue', cursor: 'pointer', marginRight: 8 }}
                      />
                      <Delete
                        style={{
                          color: 'red',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleDelete(row._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box sx={style}>
            <Typography id='modal-modal-title' variant='h6' component='h2'>
              {modalType === 'edit' ? 'Cập nhật' : 'Thêm mới'}
            </Typography>
            <TextField
              id='outlined-basic'
              label='Tên Bot'
              variant='outlined'
              fullWidth
              sx={{ mt: 10 }}
              onChange={e => {
                setFormData({
                  ...formData,
                  name: e.target.value
                })
              }}
              value={formData.name}
            />
            <TextField
              id='outlined-basic'
              label='Token'
              variant='outlined'
              fullWidth
              sx={{ mt: 10 }}
              onChange={e => {
                setFormData({
                  ...formData,
                  token: e.target.value
                })
              }}
              value={formData.token}
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
                  modalType === 'edit' ? handleEditBot() : handleAddBot()
                }}
              >
                {modalType === 'edit' ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button
                variant='contained'
                sx={{ mt: 10, backgroundColor: 'red', color: 'white', cursor: 'pointer' }}
                onClick={() => {
                  setOpenModal(false)
                  setFormData({
                    name: '',
                    token: '',
                    _id: ''
                  })
                }}
              >
                Đóng
              </Button>
            </div>
          </Box>
        </Modal>
        <Snackbar
          open={open}
          autoHideDuration={1000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleClose} severity={messageType} variant='filled' sx={{ width: '100%' }}>
            {notification}
          </Alert>
        </Snackbar>
      </Card>
    </>
  )
}

export default BotTable
