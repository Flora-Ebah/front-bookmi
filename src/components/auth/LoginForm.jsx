import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FormCard, Input, Button, Checkbox } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { ERROR_MESSAGES } from '../../services/config/constants';

const LoginForm = () => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si l'utilisateur a été redirigé depuis une autre page, on récupère cette information
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Tentative de connexion
      const result = await login(formData);
      
      // Si on a été redirigé depuis une autre page, on y retourne
      if (from !== '/') {
        navigate(from);
      }
      
      // Sinon, la redirection est gérée par le service d'authentification
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response) {
        if (error.response.status === 401) {
          setError(ERROR_MESSAGES.LOGIN_FAILED);
        } else {
          setError(error.response.data?.error || ERROR_MESSAGES.DEFAULT);
        }
      } else {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard
      title="Connexion à votre compte"
      subtitle="Pas encore inscrit ?"
      linkText="Créez votre compte maintenant"
      linkUrl="/auth/register"
      error={error}
      onErrorClose={() => setError('')}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Adresse email"
          placeholder="exemple@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <Input
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={loading}
            label="Se souvenir de moi"
          />

          <div className="text-sm">
            <Link to="/auth/forgot-password" className="font-medium text-bookmi-blue hover:text-primary-light">
              Mot de passe oublié?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>
    </FormCard>
  );
};

export default LoginForm; 