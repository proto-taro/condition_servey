
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
  if (!loginButton) {
    console.error('login-button が見つかりません')
    return
  }

  loginButton.addEventListener('click', async (event) => {
    event.preventDefault() // ← これがないとフォーム送信が発生する
      
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

document.addEventListener('DOMContentLoaded', () => {
  // ログインボタンの取得と処理
  const loginButton = document.querySelector('#login-form button')
  loginButton.addEventListener('click', async () => {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (!error) {
      showAfterLogin()
    } else {
      alert('ログイン失敗: ' + error.message)
    }
  })

  // ログアウト処理
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut()
    location.reload()
  })
})

  // ログイン後の表示制御
  const showAfterLogin = () => {
    document.getElementById('form-description').classList.remove('hidden')
    document.getElementById('survey-form').classList.remove('hidden')
    document.getElementById('logout-btn').style.display = 'inline'
  }

  // 送信ボタンの処理
  document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#survey-form button')
  if (!submitButton) {
    console.error('submitButton が見つかりません')
    return
  }

  submitButton.addEventListener('click', async (event) => {
    event.preventDefault()

    const condition = document.getElementById('condition').value
    const comment = document.getElementById('comment').value
    const { data: { user }, error: userError } = await supabase.auth.getUser()

   if (userError || !user) {
      console.error('ユーザー取得エラー:', userError)
  alert('ログインしてから送信してください')
  return
}

    // 投稿済みチェック（テストアカウント除外）
    if (user.email !== 'sales@prsys.jp') {
      const { data: recent } = await supabase
        .from('responses')
        .select('created_at')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)

      if (recent && recent.length > 0) {
        const last = new Date(recent[0].created_at)
        const now = new Date()
        const diffDays = (now - last) / (1000 * 60 * 60 * 24)

        if (diffDays < 7) {
          alert('前回の投稿から7日経っていません。')
          return
        }
      }
    }
        // 投稿処理
      const { error } = await supabase.from('responses').insert([{
        email: user.email,
        condition: parseInt(condition),
        comment: comment,
        created_at: new Date().toISOString()
      }])
  

     if (error) {
        console.error('投稿エラー:', error)
        alert('送信失敗: ' + error.message)
        } else {
         alert('送信完了！')
         setTimeout(() => {
         document.getElementById('survey-form').style.display = 'none'
         document.getElementById('status').textContent = '回答ありがとうございました！'
         }, 500) // ← 少し遅らせてポート閉鎖を回避
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


