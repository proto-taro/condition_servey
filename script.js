const supabase = supabase.createClient(
  'https://kgrvnxtmfgbwpegexwqy.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncnZueHRtZmdid3BlZ2V4d3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzUyNTQsImV4cCI6MjA3NjgxMTI1NH0.ePwTBmz-6m4S0AkbE6kGwr68Bsh05CyaD_ZoYTQUfDY'
)

function showSurveyForm() {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('survey-form').style.display = 'block'
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  const { userData, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert('ログイン失敗: ' + error.message)
  } else {
    alert('ログイン成功！')
    document.getElementById('login-form').style.display = 'none'
    document.getElementById('survey-form').style.display = 'block'
  }
})

document.getElementById('survey-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const condition = parseInt(document.getElementById('condition').value)
  const comment = document.getElementById('comment').value

  const {
    data: userData 
  } = await supabase.auth.getUser()

  await supabase.from('responses').insert([
    {
    user_id: userData.user.id,
    email: userData.user.email,
    condition,
    comment,
    created_at: new Date().toISOString()
    }
  ])

  if (error) {
    alert('送信失敗: ' + error.message)
  } else {
    alert('送信完了！ありがとうございました')
  }

})

