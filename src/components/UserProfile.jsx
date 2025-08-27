import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import {
  User,
  Edit,
  Save,
  X,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Bell,
  MessageSquare,
  Lock,
  ShieldCheck,
  Key
} from 'lucide-react'
import { useAuth } from '../App.jsx'

const API_BASE_URL = '/api'

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Soumise' },
    under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En cours' },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approuvée' },
    rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejetée' },
    incomplete: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Incomplète' }
  }
  
  const config = statusConfig[status] || statusConfig.submitted
  const Icon = config.icon
  
  return (
    <Badge variant="secondary" className={config.color}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

// Application card component
function ApplicationCard({ application, onView }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{application.service_type}</CardTitle>
            <CardDescription>
              ID: {application.tracking_id}
            </CardDescription>
          </div>
          <StatusBadge status={application.status} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Soumise le {new Date(application.submitted_at).toLocaleDateString('fr-FR')}
          </div>
          
          {application.reviewed_at && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Examinée le {new Date(application.reviewed_at).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => onView(application)}>
            <Eye className="h-4 w-4 mr-1" />
            Voir détails
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Notifications Tab Component
function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState({ email_notifications: false, sms_notifications: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadNotifications()
    loadPreferences()
  }, [])

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Erreur lors du chargement des notifications.')
    }
  }

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch preferences')
      const data = await response.json()
      setPreferences(data)
    } catch (err) {
      console.error('Error loading preferences:', err)
      setError('Erreur lors du chargement des préférences de notification.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to mark as read')
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Error marking as read:', err)
      setError('Erreur lors de la mise à jour du statut de la notification.')
    }
  }

  const handlePreferenceChange = async (type, value) => {
    const newPreferences = { ...preferences, [type]: value }
    setPreferences(newPreferences)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPreferences)
      })
      if (!response.ok) throw new Error('Failed to update preferences')
      setSuccess('Préférences de notification mises à jour.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating preferences:', err)
      setError('Erreur lors de la mise à jour des préférences.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Préférences de Notification</CardTitle>
          <CardDescription>Gérez comment vous recevez les notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Notifications par Email</span>
            </Label>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Notifications par SMS</span>
            </Label>
            <Switch
              id="sms-notifications"
              checked={preferences.sms_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('sms_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes Notifications</CardTitle>
          <CardDescription>Consultez vos dernières notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-center justify-between p-3 border rounded-md ${notification.is_read ? 'bg-muted/50' : 'bg-background'}`}
                >
                  <div>
                    <p className={`font-medium ${notification.is_read ? 'text-muted-foreground' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UserProfile() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 2FA State
  const [loading2FA, setLoading2FA] = useState(false)
  const [secret2FA, setSecret2FA] = useState('')
  const [qrCodeUri, setQrCodeUri] = useState('')
  const [twoFAToken, setTwoFAToken] = useState('')
  const [error2FA, setError2FA] = useState('')
  const [success2FA, setSuccess2FA] = useState('')
  const [disable2FAPassword, setDisable2FAPassword] = useState('')

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loadingPasswordChange, setLoadingPasswordChange] = useState(false)
  const [errorPasswordChange, setErrorPasswordChange] = useState('')
  const [successPasswordChange, setSuccessPasswordChange] = useState('')
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    date_of_birth: user?.date_of_birth || '',
    cin: user?.cin || ''
  })

  // Load user applications and statistics
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        
        // Load applications
        const appsResponse = await fetch(`${API_BASE_URL}/applications/`, { headers })
        if (appsResponse.ok) {
          const appsData = await appsResponse.json()
          setApplications(appsData.applications || [])
        }
        
        // Load statistics
        const statsResponse = await fetch(`${API_BASE_URL}/applications/statistics`, { headers })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStatistics(statsData)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    if (user) {
      loadUserData()
    }
  }, [user])

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Update failed')
      }
      
      setSuccess('Profil mis à jour avec succès')
      setEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form data to original user data
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      date_of_birth: user?.date_of_birth || '',
      cin: user?.cin || ''
    })
    setEditing(false)
    setError('')
  }

  const handleViewApplication = (application) => {
    // Navigate to application details or show modal
    // For now, just log the application
    console.log('View application:', application)
    alert(`Détails de la demande ${application.tracking_id} - Statut: ${application.status}`)
  }

  const handleSetup2FA = async () => {
    setLoading2FA(true)
    setError2FA('')
    setSuccess2FA('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to setup 2FA')
      }
      const data = await response.json()
      setSecret2FA(data.secret)
      setQrCodeUri(data.otp_uri)
      setSuccess2FA('QR Code généré. Scannez-le et vérifiez.')
    } catch (error) {
      setError2FA(error.message)
    } finally {
      setLoading2FA(false)
    }
  }

  const handleVerify2FA = async () => {
    setLoading2FA(true)
    setError2FA('')
    setSuccess2FA('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: twoFAToken }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to verify 2FA')
      }
      setSuccess2FA('2FA activée avec succès!')
      // Optionally refresh user data to reflect 2FA status
      // This would require a context update or re-fetching user data
    } catch (error) {
      setError2FA(error.message)
    } finally {
      setLoading2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    setLoading2FA(true)
    setError2FA('')
    setSuccess2FA('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: disable2FAPassword }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to disable 2FA')
      }
      setSuccess2FA('2FA désactivée avec succès!')
      setSecret2FA('')
      setQrCodeUri('')
      setTwoFAToken('')
      setDisable2FAPassword('')
      // Optionally refresh user data to reflect 2FA status
    } catch (error) {
      setError2FA(error.message)
    } finally {
      setLoading2FA(false)
    }
  }

  const handleChangePassword = async () => {
    setLoadingPasswordChange(true)
    setErrorPasswordChange('')
    setSuccessPasswordChange('')
    if (newPassword !== confirmNewPassword) {
      setErrorPasswordChange('Les nouveaux mots de passe ne correspondent pas.')
      setLoadingPasswordChange(false)
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change password')
      }
      setSuccessPasswordChange('Mot de passe changé avec succès!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      setErrorPasswordChange(error.message)
    } finally {
      setLoadingPasswordChange(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à votre profil.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et suivez vos demandes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
          <TabsTrigger value="applications">Mes demandes</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Modifiez vos informations personnelles
                  </CardDescription>
                </div>
                
                {!editing ? (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      <Save className="h-4 w-4 mr-1" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => handleProfileInputChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => handleProfileInputChange('last_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => handleProfileInputChange('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => handleProfileInputChange('date_of_birth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cin">CIN</Label>
                  <Input
                    id="cin"
                    value={profileData.cin}
                    onChange={(e) => handleProfileInputChange('cin', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Mes demandes
              </CardTitle>
              <CardDescription>
                Suivez le statut de vos demandes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune demande soumise pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applications.map(app => (
                    <ApplicationCard key={app.id} application={app} onView={handleViewApplication} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Statistiques de mes demandes
              </CardTitle>
              <CardDescription>
                Aperçu de vos activités sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                    <span className="text-4xl font-bold text-primary">{statistics.total_applications}</span>
                    <p className="text-muted-foreground">Demandes totales</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                    <span className="text-4xl font-bold text-green-500">{statistics.approved_applications}</span>
                    <p className="text-muted-foreground">Approuvées</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                    <span className="text-4xl font-bold text-yellow-500">{statistics.pending_applications}</span>
                    <p className="text-muted-foreground">En attente</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                    <span className="text-4xl font-bold text-red-500">{statistics.rejected_applications}</span>
                    <p className="text-muted-foreground">Rejetées</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune statistique disponible pour le moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Sécurité du compte
              </CardTitle>
              <CardDescription>
                Gérez vos paramètres de sécurité, y compris la double authentification et le changement de mot de passe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center"><ShieldCheck className="h-5 w-5 mr-2" /> Double Authentification (2FA)</h3>
                {user?.is_2fa_enabled ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>La double authentification est activée.</AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>La double authentification n'est pas activée. Activez-la pour une sécurité renforcée.</AlertDescription>
                  </Alert>
                )}

                {!user?.is_2fa_enabled && (
                  <Button onClick={handleSetup2FA} disabled={loading2FA}>
                    {loading2FA ? "Génération du QR Code..." : "Activer la 2FA"}
                  </Button>
                )}

                {qrCodeUri && (
                  <div className="space-y-4 mt-4">
                    <p>Scannez ce QR code avec votre application d'authentification (ex: Google Authenticator):</p>
                    <img src={qrCodeUri} alt="QR Code 2FA" className="w-48 h-48 border p-2" />
                    <p className="text-sm text-muted-foreground">Ou entrez le code manuellement: <strong>{secret2FA}</strong></p>
                    <div className="space-y-2">
                      <Label htmlFor="2fa-token">Code de vérification</Label>
                      <Input
                        id="2fa-token"
                        value={twoFAToken}
                        onChange={(e) => setTwoFAToken(e.target.value)}
                        placeholder="Entrez le code de votre application 2FA"
                      />
                    </div>
                    <Button onClick={handleVerify2FA} disabled={loading2FA}>
                      {loading2FA ? "Vérification..." : "Vérifier et Activer"}
                    </Button>
                    {error2FA && <Alert variant="destructive"><AlertDescription>{error2FA}</AlertDescription></Alert>}
                    {success2FA && <Alert><AlertDescription>{success2FA}</AlertDescription></Alert>}
                  </div>
                )}

                {user?.is_2fa_enabled && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="disable-2fa-password">Mot de passe actuel pour désactiver la 2FA</Label>
                    <Input
                      id="disable-2fa-password"
                      type="password"
                      value={disable2FAPassword}
                      onChange={(e) => setDisable2FAPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                    />
                    <Button variant="destructive" onClick={handleDisable2FA} disabled={loading2FA}>
                      {loading2FA ? "Désactivation..." : "Désactiver la 2FA"}
                    </Button>
                    {error2FA && <Alert variant="destructive"><AlertDescription>{error2FA}</AlertDescription></Alert>}
                    {success2FA && <Alert><AlertDescription>{success2FA}</AlertDescription></Alert>}
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold flex items-center"><Key className="h-5 w-5 mr-2" /> Changer le mot de passe</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={loadingPasswordChange}>
                  {loadingPasswordChange ? "Changement..." : "Changer le mot de passe"}
                </Button>
                {errorPasswordChange && <Alert variant="destructive"><AlertDescription>{errorPasswordChange}</AlertDescription></Alert>}
                {successPasswordChange && <Alert><AlertDescription>{successPasswordChange}</AlertDescription></Alert>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

