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
import { Alert, Button, Modal, Snackbar, Switch, TextField, TextareaAutosize } from '@mui/material'
import { useEffect, useState } from 'react'
import SendOutline from 'mdi-material-ui/SendOutline'
import { sendMessages } from 'src/apiRequests/sendMessages'
import {
  ApplicationSettingsOutline,
  CircleEditOutline,
  Delete,
  Emoticon,
  FaceManOutline,
  FaceManProfile,
  SettingsHelper,
  TableEdit
} from 'mdi-material-ui'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import SettingsGroupModal from 'src/@core/components/modal/SettingsGroupModal'
import { Cron } from 'react-js-cron'
import 'react-js-cron/dist/styles.css'
import { url } from 'src/utils/constant'

const styleModal = {
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4
}

const style = {
  position: 'absolute',
  top: '40%',
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

  const [openModalSettings, setOpenModalSettings] = useState(false)
  const [openModalGroupSettings, setOpenModalGroupSettings] = useState(false)

  const [openEmojiSetting, setOpenEmojiSetting] = useState(false)

  const [dataEdit, setDataEdit] = useState({
    groupId: '',
    name: '',
    cronMessage: '',
    cronTime: '',
    activeCron: false
  })

  const [openEmoji, setOpenEmoji] = useState({})

  const handleChange = async event => {
    try {
      setMessage({})
      const data = await fetch(`${url}/api/bots/get-by-id/${event.target.value}`)
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
    const data = await fetch(`${url}/api/bots`)
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
      const data = await fetch(`${url}/api/bots/remove-group`, {
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
      const data = await fetch(`${url}/api/bots/add-group`, {
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

  const handleUpdateCron = async (groupId, botId, cronMessage) => {
    try {
      const data = await fetch(`${url}/api/send-message/update-cron`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId,
          botId,
          cronTime: dataEdit.cronTime,
          token: botData.token,
          cronMessage
        })
      })

      const response = await data.json()
      if (response.status === 200) {
        fetchData()
        setMessageType('success')
        setNotification('Cập nhật cron thành công!')
        setOpenModalSettings(false)
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

  const handleUpdateGroup = async payload => {
    try {
      const data = await fetch(`${url}/api/bots/update-group`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload
        })
      })

      const response = await data.json()
      if (response.status === 200) {
        fetchData()
        setMessageType('success')
        setNotification('Cập nhật thành công!')
        setOpenModalGroupSettings(false)
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

  const handleToggleCron = async ({ groupId, botId, activeCron }) => {
    try {
      let data
      if (activeCron) {
        data = await fetch(`${url}/api/send-message/start-cron`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            groupId,
            botId,
            name: formData.name,
            token: botData.token
          })
        })
      } else {
        data = await fetch(`${url}/api/send-message/stop-cron`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            groupId,
            botId,
            name: formData.name,
            token: botData.token
          })
        })
      }
      const response = await data.json()

      if (response.status === 200) {
        fetchData()
        setMessageType('success')
        setNotification(response.message)
        setOpen(true)
      }

      if (response.status === 400) {
        setMessageType('error')
        setNotification(response.message)
        setOpen(true)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
        className='dashboard-chatbot'
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
      <Card sx={{ overflow: 'auto', minHeight: '800px' }}>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>Id Nhóm</TableCell>
                <TableCell>Tên nhóm</TableCell>
                <TableCell>Active cron</TableCell>
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
                    <Switch
                      defaultChecked={row.activeCron}
                      onChange={async e => {
                        handleToggleCron({
                          groupId: row.groupId,
                          botId: selectedBot,
                          activeCron: e.target.checked
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div style={{ position: 'relative', maxWidth: '400px' }} className='chatbox'>
                      <textarea
                        id='txtDebug'
                        style={{
                          width: '100%',
                          height: '100px',
                          padding: '10px 40px 10px 10px',
                          fontSize: '16px',
                          fontFamily: 'monospace',
                          outline: 'none',
                          borderRadius: '5px',
                          border: '1px solid #ccc',
                          maxWidth: '400px',
                          resize: 'none'
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

                      {openEmoji[row.groupId] && (
                        <Picker
                          data={data}
                          onEmojiSelect={e => {
                            setMessage(prev => {
                              const mes = prev[row.groupId] ? prev[row.groupId] : ''

                              return {
                                ...prev,
                                [row.groupId]: mes + e.native
                              }
                            })
                          }}
                          style={{
                            position: 'absolute'
                          }}
                        />
                      )}

                      <Emoticon
                        style={{
                          position: 'absolute',
                          right: 20,
                          top: 10,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setOpenEmoji(prev => {
                            // Đóng tất cả các bảng emoji
                            const newOpenEmoji = Object.keys(prev).reduce((acc, key) => {
                              acc[key] = false
                              // eslint-disable-next-line newline-before-return
                              return acc
                            }, {})

                            // Mở bảng emoji cho groupId hiện tại
                            newOpenEmoji[row.groupId] = !prev[row.groupId]

                            return newOpenEmoji
                          })
                        }}
                      />
                      <SendOutline
                        onClick={() => {
                          handleSendMessage({
                            groupId: row.groupId,
                            message: message[row.groupId],
                            token: botData.token
                          })
                        }}
                        sx={{
                          color: 'action.active',
                          cursor: 'pointer',
                          fontSize: 24,
                          marginLeft: 2,
                          position: 'absolute',
                          right: 20,
                          bottom: 16,
                          zIndex: 1000
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        onClick={() => {
                          setDataEdit({
                            groupId: row.groupId,
                            name: row.name,
                            cronMessage: row.cronMessage,
                            cronTime: row.cronTime,
                            activeCron: row.activeCron
                          })

                          setOpenModalSettings(true)
                        }}
                        src='/images/icons/settings-icon.svg'
                        alt='avatar'
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <Delete
                        style={{
                          color: 'red',
                          cursor: 'pointer',
                          marginLeft: 10
                        }}
                        onClick={() => {
                          handleDeleteGroup(row.groupId, botData._id)
                        }}
                      />
                      <CircleEditOutline
                        style={{ color: 'green', cursor: 'pointer', marginLeft: 10 }}
                        onClick={() => {
                          setDataEdit({
                            groupId: row.groupId,
                            name: row.name,
                            cronMessage: row.cronMessage,
                            cronTime: row.cronTime,
                            activeCron: row.activeCron
                          })

                          setOpenModalGroupSettings(true)
                        }}
                      />
                    </div>
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
          </Box>
        </Modal>
        {/* 
        <SettingsGroupModal
          openModal={openModalSettings}
          setOpenModal={setOpenModalSettings}
          setFormData={setFormDataSettings}
          formData={formDataSettings}
          title='Cài đặt nhóm'
          style={style}
        /> */}
        <Modal
          open={openModalSettings}
          onClose={() => setOpenModalSettings(false)}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
          width='800px'
        >
          <Box sx={styleModal}>
            <Typography id='modal-modal-title' variant='h6' component='h2' marginBottom={6}>
              Cài đặt thời gian
            </Typography>

            <div
              style={{
                padding: '10px'
              }}
            >
              <div style={{ position: 'relative' }} className='chatbox'>
                <textarea
                  id='txtDebug'
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '10px 40px 10px 10px',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    resize: 'none'
                  }}
                  onChange={e => {
                    setDataEdit({
                      ...dataEdit,
                      cronMessage: e.target.value
                    })
                  }}
                  value={dataEdit?.cronMessage || ''}
                ></textarea>

                {openEmojiSetting && (
                  <Picker
                    data={data}
                    onEmojiSelect={e => {
                      setDataEdit(prev => {
                        const mes = prev.cronMessage ? prev.cronMessage : ''

                        return {
                          ...prev,
                          cronMessage: mes + e.native
                        }
                      })
                    }}
                    style={{
                      position: 'absolute'
                    }}
                  />
                )}

                <Emoticon
                  style={{
                    position: 'absolute',
                    right: 20,
                    top: 10,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setOpenEmojiSetting(prev => !prev)
                  }}
                />
              </div>
              <Cron
                value={dataEdit?.cronTime}
                setValue={cronValue => {
                  setDataEdit(prev => {
                    return {
                      ...prev,
                      cronTime: cronValue
                    }
                  })
                }}
              />
            </div>

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
                  handleUpdateCron(dataEdit.groupId, selectedBot, dataEdit.cronMessage)
                }}
              >
                Xác nhận
              </Button>
              <Button
                variant='contained'
                sx={{ mt: 10, backgroundColor: 'red', color: 'white', cursor: 'pointer' }}
                onClick={() => {
                  setOpenModalSettings(false)
                }}
              >
                Đóng
              </Button>
            </div>
          </Box>
        </Modal>

        <Modal
          open={openModalGroupSettings}
          onClose={() => setOpenModalSettings(true)}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
          width='400px'
        >
          <Box sx={styleModal}>
            <Typography id='modal-modal-title' variant='h6' component='h2' marginBottom={6}>
              Cập nhật thông tin nhóm
            </Typography>

            <div
              style={{
                padding: '10px'
              }}
            >
              <TextField
                id='outlined-basic'
                label='Tên nhóm'
                variant='outlined'
                fullWidth
                value={dataEdit?.name}
                style={{
                  marginBottom: '20px'
                }}
                onChange={e => {
                  setDataEdit({
                    ...dataEdit,
                    name: e.target.value
                  })
                }}
              />

              <TextField
                id='outlined-basic'
                label='Id nhóm'
                variant='outlined'
                fullWidth
                value={dataEdit?.groupId}
                style={{
                  marginBottom: '20px'
                }}
                onChange={e => {
                  setDataEdit({
                    ...dataEdit,
                    groupId: e.target.value
                  })
                }}
              />
            </div>

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
                  handleUpdateGroup({
                    groupId: dataEdit.groupId,
                    botId: selectedBot,
                    name: dataEdit.name,
                    groupId: dataEdit.groupId
                  })
                }}
              >
                Xác nhận
              </Button>
              <Button
                variant='contained'
                sx={{ mt: 10, backgroundColor: 'red', color: 'white', cursor: 'pointer' }}
                onClick={() => {
                  setOpenModalGroupSettings(false)
                }}
              >
                Đóng
              </Button>
            </div>
          </Box>
        </Modal>
        <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={messageType} variant='filled' sx={{ width: '100%' }}>
            {notification}
          </Alert>
        </Snackbar>
      </Card>
    </>
  )
}

export default DashboardTable
