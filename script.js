// Supabaseの初期化（最初に書く！）
const supabase = window.supabase.createClient(
  'https://kgrvnxtmfgbwpegexwqy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncnZueHRtZmdid3BlZ2V4d3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzUyNTQsImV4cCI6MjA3NjgxMTI1NH0.ePwTBmz-6m4S0AkbE6kGwr68Bsh05CyaD_ZoYTQUfDY'
)

// ログイン後にアンケートフォームを表示する関数
function showSurveyForm() {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('survey-form').style.display = 'block'
  document.getElementById('login-form').classList.add('hidden')
  document.getElementById('survey-form').classList.remove('hidden')
  document.getElementById('survey-form').style.display = 'none'
  document.getElementById('thank-you').style.display = 'block'
}

// ページ読み込み時にログイン済みか確認
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('#login-form button')

  loginButton.addEventListener('click', async () => {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert('ログイン失敗: ' + error.message)
      return
    }

    // ログイン成功 → 表示切り替え
   const { data: { user } } = await supabase.auth.getUser()

if (user) {
  document.getElementById('title').textContent = '今日のコンディション'
  document.getElementById('status').textContent = `ようこそ ${user.email} さん、アンケートに回答してください`
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('survey-form').style.display = 'block'
  document.getElementById('logout-btn').style.display = 'inline'
} else {
  document.getElementById('title').textContent = 'ログインしてアンケートに回答'
  document.getElementById('status').textContent = 'ログインしてアンケートに回答'
  document.getElementById('login-form').style.display = 'block'
  document.getElementById('survey-form').style.display = 'none'
  document.getElementById('logout-btn').style.display = 'none'
}

  })
})

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut()
  location.reload() // ページをリロードしてログイン状態を反映
})

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#survey-form button')

  submitButton.addEventListener('click', async (event) => {
    event.preventDefault() // ← ページリロード防止

    const condition = document.getElementById('condition').value
    const comment = document.getElementById('comment').value
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('ログインしてから送信してください')
      return
    }

    const { error } = await supabase.from('responses').insert([{
      email: user.email,
      condition: parseInt(condition),
      comment: comment,
      created_at: new Date().toISOString()
    }])

    if (error) {
      alert('送信失敗: ' + error.message)
    } else {
      alert('送信完了！')
      document.getElementById('survey-form').style.display = 'none'
      document.getElementById('status').textContent = '回答ありがとうございました！'
    }
  })
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
