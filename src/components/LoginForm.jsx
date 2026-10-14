
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './LoginForm.css'

function LoginForm() {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()

        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const response = await fetch(
                'https://localhost:7039/Users/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login,
                        password
                    })
                }
            )

            const responseText = await response.text()

            if (!response.ok) {
                throw new Error(
                    responseText || 'Nie udało się zalogować.'
                )
            }

            const data = JSON.parse(responseText)

            if (!data.token) {
                throw new Error('Serwer nie zwrócił tokenu logowania.')
            }

            sessionStorage.setItem('token', data.token)

            sessionStorage.setItem('user', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email
            }))

            setSuccess(data.message || 'Zalogowano pomyślnie.')
            setPassword('')

            setTimeout(() => {
                navigate('/')
            }, 1000)
        } catch (error) {
            setError(
                error.message || 'Nie udało się połączyć z serwerem.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <h2>Logowanie</h2>

                    <p className="login-description">
                        Zaloguj się, aby korzystać z aplikacji
                    </p>

                    <div className="login-input">
                        <label htmlFor="login">
                            E-mail lub nazwa użytkownika
                        </label>

                        <input
                            id="login"
                            type="text"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            placeholder="Wpisz e-mail lub nazwę użytkownika"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-input">
                        <label htmlFor="password">
                            Hasło
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Wpisz swoje hasło"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="login-success">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>

                    <Link to="/register" className="register-toggle">
                        Nie masz konta? Zarejestruj się
                    </Link>
                </form>

                <div className="back-button-container">
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate('/')}
                    >
                        ← Wróć do strony głównej
                    </button>
                </div>

            </div>
        </div>
    )
}

export default LoginForm