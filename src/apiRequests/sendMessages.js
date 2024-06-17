const url = 'http://localhost:4000/api'

export const sendMessages = async payload => {
  try {
    const response = await fetch(`${url}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (response.status === 200) {
      return response.json()
    } else {
      throw new Error('Error sending message')
    }
  } catch (error) {
    console.error(error)
  }
}
