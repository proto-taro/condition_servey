// Supabaseの初期化（最初に書く！）
const supabase = window.supabase.createClient(
  'https://YOUR_PROJECT_ID.supabase.co',
  'YOUR_PUBLIC_ANON_KEY'
)

// ログイン後にアンケートフォームを表示する関数
function showSurveyForm() {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('survey-form').style.display = 'block'
}

// ログイン処理
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) {
    alert('ログイン失敗: ' + loginError.message)
  } else {
    console.log('ログイン成功:', loginData)
    showSurveyForm()
  }
})

// アンケート送信処理
document.getElementById('survey-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const condition = parseInt(document.getElementById('condition').value)
  const comment = document.getElementById('comment').value

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    alert('ユーザー情報の取得に失敗しました')
    return
  }

  const { error: insertError } = await supabase.from('responses').insert([
    {
      user_id: userData.user.id,
      email: userData.user.email,
      condition,
      comment,
      created_at: new Date().toISOString()
    }
  ])

  if (insertError) {
    alert('送信失敗: ' + insertError.message)
  } else {
    alert('送信完了！ありがとうございました')
    document.getElementById('survey-form').reset()
  }
})
