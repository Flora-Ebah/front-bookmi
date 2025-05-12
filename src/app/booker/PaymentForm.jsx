import React, { useState } from 'react';
import { Button, Input, Select, Radio } from '../../components/ui';
import { FiCreditCard, FiCheckCircle, FiPhone, FiDollarSign, FiInfo, FiLock } from 'react-icons/fi';
import paymentService from '../../services/paymentService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

// Options de paiement
const PAYMENT_OPTIONS = [
  { id: 'credit_card', label: 'Carte de crédit', icon: <FiCreditCard /> },
  { id: 'mobile_money', label: 'Mobile Money', icon: <FiPhone /> },
];

// Types de paiement
const PAYMENT_TYPES = [
  { id: 'full', label: 'Paiement complet', description: 'Payer le montant total maintenant' },
  { id: 'advance', label: 'Acompte', description: 'Payer 50% maintenant, le reste avant l\'événement' },
];

const PaymentForm = ({ reservation, onSuccess, onCancel }) => {
  // État du formulaire
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentType, setPaymentType] = useState('full');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvc: '',
    phoneNumber: '',
    operator: 'orange'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Calcul du montant total
  const totalAmount = reservation?.amount + (reservation?.serviceFee || 0);
  
  // Calcul du montant à payer en fonction du type de paiement
  const amountToPay = paymentType === 'advance' ? Math.round(totalAmount * 0.5) : totalAmount;
  const serviceFee = reservation?.serviceFee || paymentService.calculateServiceFee(reservation?.amount || 0);

  // Formatter le prix
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return 'Prix non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'credit_card') {
      if (!formData.cardNumber) newErrors.cardNumber = "Numéro de carte requis";
      else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
        newErrors.cardNumber = "Numéro de carte invalide";
      
      if (!formData.cardHolder) newErrors.cardHolder = "Nom du titulaire requis";
      
      if (!formData.expiryDate) newErrors.expiryDate = "Date d'expiration requise";
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) 
        newErrors.expiryDate = "Format MM/YY requis";
      
      if (!formData.cvc) newErrors.cvc = "Code de sécurité requis";
      else if (!/^\d{3,4}$/.test(formData.cvc)) 
        newErrors.cvc = "Code de sécurité invalide";
    }
    
    if (paymentMethod === 'mobile_money') {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Numéro de téléphone requis";
      } else {
        // Nettoyer le numéro de téléphone (garder seulement les chiffres et le +)
        const cleanedPhone = formData.phoneNumber.replace(/[^\d+]/g, '');
        
        // Vérifier que le numéro contient au moins 9 chiffres après un éventuel "+"
        if (!/^\+?\d{9,15}$/.test(cleanedPhone)) {
          newErrors.phoneNumber = "Numéro de téléphone invalide";
        }
      }
        
      if (!formData.operator) newErrors.operator = "Opérateur requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Préparation du numéro de téléphone pour l'envoi
  const formatPhoneNumber = (phoneNumber) => {
    // Nettoyer le numéro (garder les chiffres et le +)
    return phoneNumber.replace(/[^\d+]/g, '');
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier que l'utilisateur est authentifié
    if (!authService.isAuthenticated()) {
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      if (onCancel) onCancel();
      return;
    }
    
    // Test approfondi d'authentification
    try {
      const isAuthenticated = await paymentService.testAuthentication();
      if (!isAuthenticated) {
        toast.error("Problème d'authentification détecté. Veuillez vous reconnecter.");
        if (onCancel) onCancel();
        return;
      }
    } catch (authError) {
      console.error("Erreur lors du test d'authentification:", authError);
      toast.error("Problème d'authentification. Veuillez vous reconnecter.");
      if (onCancel) onCancel();
      return;
    }
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    
    setLoading(true);
    
    try {
      // Préparer les données de paiement
      const paymentData = {
        reservationId: reservation._id,
        amount: amountToPay,
        serviceFee,
        paymentMethod: paymentMethod === 'credit_card' ? 'visa' : formData.operator,
        paymentType,
        paymentDetails: paymentMethod === 'credit_card' 
          ? {
              cardNumber: formData.cardNumber.replace(/\s/g, ''),
              cardholderName: formData.cardHolder,
              expiryDate: formData.expiryDate,
              cvv: formData.cvc
            }
          : {
              phoneNumber: formData.phoneNumber.replace(/[^\d+]/g, ''),
              operator: formData.operator
            },
        notes: `Paiement ${paymentType === 'advance' ? 'acompte' : 'complet'} pour la réservation du ${new Date(reservation?.date).toLocaleDateString('fr-FR')}`
      };
      
      // Appel au service de paiement
      console.log("Envoi des données de paiement:", paymentData);
      
      // Vérifier de nouveau le token juste avant l'envoi
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        if (onCancel) onCancel();
        return;
      }
      
      const response = await paymentService.createPayment(paymentData);
      
      if (response.success) {
        toast.success("Paiement effectué avec succès!");
        if (onSuccess) onSuccess(response.data);
      } else {
        toast.error(response.message || "Échec du paiement. Veuillez réessayer.");
      }
      
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      
      // Gérer spécifiquement les erreurs d'authentification
      if (error.response?.status === 401) {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        if (onCancel) onCancel();
      } else {
        toast.error(error.response?.data?.error || "Échec du paiement. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Rendu du formulaire en fonction du mode de paiement
  const renderPaymentForm = () => {
    if (paymentMethod === 'credit_card') {
      return (
        <div className="space-y-4">
          <div>
            <Input
              label="Numéro de carte"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              error={errors.cardNumber}
              icon={<FiCreditCard className="text-gray-400" />}
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              label="Titulaire de la carte"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleChange}
              placeholder="JOHN DOE"
              error={errors.cardHolder}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Date d'expiration"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                error={errors.expiryDate}
                className="w-full"
              />
            </div>
            <div>
              <Input
                label="CVC"
                name="cvc"
                value={formData.cvc}
                onChange={handleChange}
                placeholder="123"
                error={errors.cvc}
                className="w-full"
                icon={<FiLock className="text-gray-400" />}
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (paymentMethod === 'mobile_money') {
      return (
        <div className="space-y-4">
          <div>
            <Input
              label="Numéro de téléphone"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Ex: +225 07 00 95 47 48"
              error={errors.phoneNumber}
              icon={<FiPhone className="text-gray-400" />}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: avec ou sans préfixe international (+225, +233, etc.)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opérateur
            </label>
            <Select
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              options={[
                { value: 'orange', label: 'Orange Money' },
                { value: 'mtn', label: 'MTN Mobile Money' },
                { value: 'moov', label: 'Moov Money' },
                { value: 'wave', label: 'Wave' }
              ]}
              error={errors.operator}
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <FiInfo className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Vous recevrez un code OTP sur ce numéro pour valider votre paiement. Assurez-vous qu'il est correct et actif.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Résumé de la réservation */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
          <FiInfo className="mr-2 text-bookmi-blue" />
          Résumé de la réservation
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{reservation?.serviceId?.title || 'Service'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{new Date(reservation?.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Montant total:</span>
            <span className="font-medium">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Options de type de paiement */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-3">Type de paiement</h3>
          
          <div className="space-y-3">
            {PAYMENT_TYPES.map((type) => (
              <div 
                key={type.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentType === type.id 
                    ? 'border-bookmi-blue bg-bookmi-blue bg-opacity-5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentType(type.id)}
              >
                <div className="flex items-center">
                  <Radio
                    checked={paymentType === type.id}
                    onChange={() => setPaymentType(type.id)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                    {type.id === 'advance' && (
                      <div className="text-bookmi-blue font-medium mt-1">
                        {formatPrice(totalAmount * 0.5)} maintenant
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Méthodes de paiement */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-3">Méthode de paiement</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_OPTIONS.map((option) => (
              <div 
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === option.id 
                    ? 'border-bookmi-blue bg-bookmi-blue bg-opacity-5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod(option.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-2 ${paymentMethod === option.id ? 'text-bookmi-blue' : 'text-gray-500'}`}>
                    {option.icon}
                  </div>
                  <div className="font-medium">{option.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Formulaire spécifique à la méthode de paiement */}
        <div className="mb-6">
          {renderPaymentForm()}
        </div>
        
        {/* Montant à payer */}
        <div className="mb-6 bg-bookmi-blue bg-opacity-5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Montant à payer:</span>
            <span className="text-xl font-bold text-bookmi-blue">{formatPrice(amountToPay)}</span>
          </div>
          
          {paymentType === 'advance' && (
            <div className="mt-2 text-sm text-gray-600">
              Le solde de {formatPrice(totalAmount - amountToPay)} sera à régler avant l'événement.
            </div>
          )}
        </div>
        
        {/* Certification et sécurité */}
        <div className="mb-6 flex items-center justify-center text-sm text-gray-500">
          <FiLock className="mr-2" />
          <span>Paiement sécurisé via notre plateforme certifiée</span>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                Traitement...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FiCheckCircle className="mr-2" />
                Payer {formatPrice(amountToPay)}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 