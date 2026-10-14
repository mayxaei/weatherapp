
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Podane hasła nie są identyczne.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                'https://localhost:7039/Users/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const responseText = await response.text();

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = { message: responseText };
            }

            if (!response.ok) {
                throw new Error(
                    data.message || responseText ||
                    'Nie udało się utworzyć konta.'
                );
            }

            setSuccess(
                data.message || 'Konto zostało utworzone.'
            );

            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(
                error.message || 'Nie udało się połączyć z serwerem.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <h2>Rejestracja</h2>

                    <p className="login-description">
                        Utwórz nowe konto
                    </p>

                    <div className="login-input">
                        <label htmlFor="username">
                            Nazwa użytkownika
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Wpisz nazwę użytkownika"
                            maxLength={50}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-input">
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Wpisz swój e-mail"
                            maxLength={255}
                            autoComplete="email"
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
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="login-input">
                        <label htmlFor="confirmPassword">
                            Powtórz hasło
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Powtórz swoje hasło"
                            autoComplete="new-password"
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
                        {loading
                            ? 'Tworzenie konta...'
                            : 'Zarejestruj się'}
                    </button>

                    <Link
                        to="/login"
                        className="register-toggle"
                    >
                        Masz już konto? Zaloguj się
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
    );
}

export default RegisterForm;