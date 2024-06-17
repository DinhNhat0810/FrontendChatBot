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
import { ApplicationSettingsOutline } from 'mdi-material-ui'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

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

const DashboardTable = () => {
  const [message, setMessage] = useState({})
  const [open, setOpen] = useState(false)

  const [messageType, setMessageType] = useState('success')
  const [notification, setNotification] = useState('')

  const [bots, setBots] = useState([])
  const [selectedBot, setSelectedBot] = useState('')

  const [botData, setBotData] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  const [formData, setFormData] = useState({
    botId: '',
    name: '',
    groupId: ''
  })

  const handleChange = async event => {
    try {
      setMessage({})
      const data = await fetch(`http://localhost:4000/api/bots/get-by-id/${event.target.value}`)
      const bot = await data.json()
      setSelectedBot(event.target.value)
      if (bot.status === 200) {
        setBotData(bot.payload)
      }
    } catch (error) {
      console.error(error)
    }
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
        setMessage(prev => {
          return {
            ...prev,
            [values.groupId]: ''
          }
        })
        setMessageType('success')
        setNotification('Gửi tin nhắn thành công!')
        setOpen(true)
      }
    } catch (error) {
      setMessageType('error')
      setNotification('Có lỗi xảy ra, vui lòng thử lại!')
      setOpen(true)
    }
  }

  const fetchData = async () => {
    const data = await fetch('http://localhost:4000/api/bots')
    const bots = await data.json()
    setBots(bots.payload)

    setSelectedBot(bots.payload[0]._id)
    setBotData(bots.payload[0])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteGroup = async (groupId, botId) => {
    try {
      const data = await fetch(`http://localhost:4000/api/bots/remove-group`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId,
          botId
        })
      })
      const response = await data.json()
      if (response.status === 200) {
        setBotData(prev => {
          return {
            ...prev,
            listGroup: prev.listGroup.filter(group => group.groupId !== groupId)
          }
        })
        setMessageType('success')
        setNotification('Xóa nhóm thành công!')
        setOpen(true)
      }
    } catch (error) {
      setMessageType('error')
      setNotification('Có lỗi xảy ra, vui lòng thử lại!')
      setOpen(true)
    }
  }

  const handleAddGroup = async (groupId, botId) => {
    try {
      const data = await fetch(`http://localhost:4000/api/bots/add-group`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId,
          botId,
          name: formData.name
        })
      })
      const response = await data.json()
      if (response.status === 200) {
        setBotData(prev => {
          return {
            ...prev,
            listGroup: [...prev.listGroup, { groupId, name: formData.name }]
          }
        })

        setMessageType('success')
        setNotification('Thêm nhóm thành công!')
        setOpenModal(false)
        setFormData({
          name: '',
          groupId: ''
        })
        setOpen(true)
      }

      if (response.status === 400) {
        setMessageType('error')
        setNotification(response.message)
        setOpen(true)
      }
    } catch (error) {
      setMessageType('error')
      setNotification('Có lỗi xảy ra, vui lòng thử lại!')
      setOpen(true)
    }
  }

  function log(text) {
    let txtArea

    txtArea = document.getElementById('txtDebug')
    txtArea.value += '\r\n'
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <h2 style={{}}>Danh sách nhóm</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id='demo-simple-select-label'>Bots</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={selectedBot ? selectedBot : ''}
                label='Bot'
                onChange={handleChange}
              >
                {bots?.length > 0 &&
                  bots.map((bot, index) => (
                    <MenuItem key={index} value={bot._id}>
                      {bot.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            style={{
              color: 'blue',
              cursor: 'pointer',
              marginLeft: 10
            }}
            onClick={() => {
              setOpenModal(true)
            }}
          >
            Thêm nhóm
          </Button>
        </div>
      </div>
      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>Id Nhóm</TableCell>
                <TableCell>Tên nhóm</TableCell>
                <TableCell>Gửi tin nhắn</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botData?.listGroup?.map(row => (
                <TableRow hover key={row.name} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                  <TableCell>{row.groupId}</TableCell>
                  <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.name}</Typography>
                      <Typography variant='caption'>{row.designation}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      {/* <TextField
                        id='input-with-sx'
                        variant='standard'
                        onChange={e => {
                          setMessage(prev => {
                            return {
                              ...prev,
                              [row.groupId]: e.target.value
                            }
                          })
                        }}
                        value={message[row.groupId] || ''}
                        onKeyPress={e => {
                          if (e.key === 'Enter' && message[row.groupId].length > 0) {
                            handleSendMessage({
                              groupId: row.groupId,
                              message: message[row.groupId],
                              token: botData.token
                            })
                          }
                        }}
                      /> */}
                      <textarea
                        id='txtDebug'
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '10px',
                          fontSize: '16px',
                          fontFamily: 'monospace',
                          outline: 'none',
                          maxWidth: '400px'
                        }}
                        onChange={e => {
                          setMessage(prev => {
                            return {
                              ...prev,
                              [row.groupId]: e.target.value
                            }
                          })
                        }}
                        value={message[row.groupId] || ''}
                      ></textarea>
                      <SendOutline
                        onClick={() => {
                          handleSendMessage({
                            groupId: row.groupId,
                            message: message[row.groupId],
                            token: botData.token
                          })
                        }}
                        sx={{ color: 'action.active', mr: 1, my: 0.5, cursor: 'pointer', fontSize: 32, marginLeft: 2 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      style={{
                        color: 'blue',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        handleDeleteGroup(row.groupId, botData._id)
                      }}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box sx={style}>
            <Typography id='modal-modal-title' variant='h6' component='h2'>
              Thêm Nhóm
            </Typography>
            <Typography id='modal-modal-description' sx={{ mt: 2 }}>
              <TextField
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
                  Thêm
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
        <Snackbar open={open} autoHideDuration={1000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={messageType} variant='filled' sx={{ width: '100%' }}>
            {notification}
          </Alert>
        </Snackbar>
      </Card>
    </>
  )
}

export default DashboardTable
