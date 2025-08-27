import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import DocumentManagement from './DocumentManagement.jsx'
import CancellationModal from './CancellationModal.jsx'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  FileText, 
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Save,
  X,
  Ban,
  MessageSquare
} from 'lucide-react'

// API helper functions
const api = {
  // Admin API calls
  getStats: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch stats')
    return response.json()
  },

  getUsers: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  updateUserStatus: async (userId, status) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    if (!response.ok) throw new Error('Failed to update user status')
    return response.json()
  },

  getApplications: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch applications')
    return response.json()
  },

  updateApplicationStatus: async (applicationId, status, notes = '') => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, notes })
    })
    if (!response.ok) throw new Error('Failed to update application status')
    return response.json()
  },

  markDocumentMissing: async (applicationId, documentName, language = 'fr') => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/mark-missing-doc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        document_name: documentName, 
        language: language 
      })
    })
    if (!response.ok) throw new Error('Failed to mark document as missing')
    return response.json()
  },

  sendCustomerMessage: async (applicationId, message, messageType = 'info') => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: message,
        message_type: messageType
      })
    })
    if (!response.ok) throw new Error('Failed to send message')
    return response.json()
  },

  getGuides: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/guides', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch guides')
    return response.json()
  },

  createGuide: async (guideData) => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/guides', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(guideData)
    })
    if (!response.ok) throw new Error('Failed to create guide')
    return response.json()
  },

  updateGuide: async (guideId, guideData) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/guides/${guideId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(guideData)
    })
    if (!response.ok) throw new Error('Failed to update guide')
    return response.json()
  },

  deleteGuide: async (guideId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/guides/${guideId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to delete guide')
    return response.json()
  }
}

// Composant pour gérer les guides
function GuideManagement() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGuide, setEditingGuide] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: [],
    estimated_duration: 15
  })

  useEffect(() => {
    loadGuides()
  }, [])

  const loadGuides = async () => {
    try {
      setLoading(true)
      const response = await api.getGuides()
      setGuides(response.guides || [])
    } catch (error) {
      console.error('Error loading guides:', error)
      setError('Erreur lors du chargement des guides')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGuide = async () => {
    try {
      const newGuide = await api.createGuide(formData)
      setGuides([...guides, newGuide.guide])
      setFormData({ title: '', description: '', steps: [], estimated_duration: 15 })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating guide:', error)
      setError('Erreur lors de la création du guide')
    }
  }

  const handleUpdateGuide = async () => {
    try {
      const updatedGuide = await api.updateGuide(editingGuide.id, formData)
      setGuides(guides.map(g => g.id === editingGuide.id ? updatedGuide.guide : g))
      setEditingGuide(null)
      setFormData({ title: '', description: '', steps: [], estimated_duration: 15 })
    } catch (error) {
      console.error('Error updating guide:', error)
      setError('Erreur lors de la mise à jour du guide')
    }
  }

  const handleDeleteGuide = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce guide ?')) return
    
    try {
      await api.deleteGuide(id)
      setGuides(guides.filter(guide => guide.id !== id))
    } catch (error) {
      console.error('Error deleting guide:', error)
      setError('Erreur lors de la suppression du guide')
    }
  }

  const startEdit = (guide) => {
    setEditingGuide(guide)
    setFormData({
      title: guide.title,
      description: guide.description,
      steps: guide.steps || [],
      estimated_duration: guide.estimated_duration || 15
    })
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingGuide(null)
    setFormData({ title: '', description: '', steps: [], estimated_duration: 15 })
    setShowCreateForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des guides...</p>
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Guides</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Guide
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingGuide ? 'Modifier le Guide' : 'Créer un Nouveau Guide'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du Guide</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Demande de Microfinancement"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description détaillée du guide..."
              />
            </div>
            <div>
              <Label htmlFor="duration">Durée estimée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                placeholder="15"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={editingGuide ? handleUpdateGuide : handleCreateGuide}>
                <Save className="h-4 w-4 mr-2" />
                {editingGuide ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Card key={guide.id} className="card-hover">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant={guide.is_active ? 'default' : 'secondary'}>
                  {guide.is_active ? 'Actif' : 'Inactif'}
                </Badge>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(guide)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteGuide(guide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{guide.title}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{guide.steps?.length || 0} étapes</span>
                <span>{guide.estimated_duration || 15} min</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Composant pour gérer les utilisateurs
function UserManagement() {
  const [users, setUsers] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [statusUpdate, setStatusUpdate] = useState({ userId: null, status: '', notes: '' })

  useEffect(() => {
    loadUsers()
    loadApplications()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await api.getUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Erreur lors du chargement des utilisateurs')
    }
  }

  const loadApplications = async () => {
    try {
      const response = await api.getApplications()
      setApplications(response.applications || [])
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await api.updateUserStatus(userId, newStatus)
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: newStatus === 'active' } : user
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
      setError('Erreur lors de la mise à jour du statut utilisateur')
    }
  }

  const getUserApplications = (userId) => {
    return applications.filter(app => app.user_id === userId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <div className="text-sm text-muted-foreground">
          {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Utilisateur</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="text-left p-4">Demandes</th>
                  <th className="text-left p-4">Inscription</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userApps = getUserApplications(user.id)
                  return (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-center">
                          <span className="font-medium">{userApps.length}</span>
                          {userApps.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {userApps.filter(app => app.status === 'pending').length} en attente
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateUserStatus(
                              user.id, 
                              user.is_active ? 'inactive' : 'active'
                            )}
                          >
                            {user.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Détails de l'utilisateur</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom complet</Label>
                <p className="text-sm">
                  {selectedUser.first_name && selectedUser.last_name 
                    ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                    : 'Non renseigné'}
                </p>
              </div>
              <div>
                <Label>Nom d'utilisateur</Label>
                <p className="text-sm">{selectedUser.username}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <Label>Téléphone</Label>
                <p className="text-sm">{selectedUser.phone || 'Non renseigné'}</p>
              </div>
            </div>
            
            <div>
              <Label>Demandes de l'utilisateur</Label>
              <div className="mt-2 space-y-2">
                {getUserApplications(selectedUser.id).map((app) => (
                  <div key={app.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">{app.guide_title}</span>
                      <div className="text-sm text-muted-foreground">
                        Soumis le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <Badge variant={
                      app.status === 'approved' ? 'default' : 
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {app.status === 'pending' ? 'En attente' :
                       app.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </Badge>
                  </div>
                ))}
                {getUserApplications(selectedUser.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune demande</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Composant pour les statistiques
function Dashboard({ onViewDocuments, onCancelApplication }) {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    pending_applications: 0,
    approved_applications: 0,
    total_guides: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, applicationsResponse] = await Promise.all([
        api.getStats(),
        api.getApplications()
      ])
      
      setStats(statsResponse.stats || {})
      setRecentApplications((applicationsResponse.applications || []).slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      await api.updateApplicationStatus(applicationId, newStatus, notes)
      setRecentApplications(recentApplications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus, admin_notes: notes } : app
      ))
    } catch (error) {
      console.error('Error updating application status:', error)
      setError('Erreur lors de la mise à jour du statut')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé'
      case 'under_review':
        return 'En cours'
      case 'rejected':
        return 'Rejeté'
      default:
        return 'En attente'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  const dashboardStats = [
    {
      title: "Utilisateurs Actifs",
      value: stats.active_users?.toString() || "0",
      total: stats.total_users || 0,
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Demandes en Attente",
      value: stats.pending_applications?.toString() || "0",
      change: "+5%",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Demandes Approuvées",
      value: stats.approved_applications?.toString() || "0",
      change: "+18%",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Guides Actifs",
      value: stats.total_guides?.toString() || "0",
      change: "0%",
      icon: FileText,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <h2 className="text-2xl font-bold">Tableau de Bord</h2>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.total && (
                    <p className="text-xs text-muted-foreground">
                      sur {stat.total} total
                    </p>
                  )}
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes Récentes</CardTitle>
          <CardDescription>
            Les dernières demandes soumises par les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune demande récente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{app.user_name || 'Utilisateur'}</p>
                      <p className="text-sm text-muted-foreground">{app.guide_title}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {app.tracking_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(app.status)}
                      <span className="text-sm">{getStatusText(app.status)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="flex space-x-1">
                      {app.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateApplicationStatus(app.id, 'approved')}
                          >
                            Approuver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDocuments?.(app)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Documents
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCancelApplication?.(app)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Composant principal du panneau d'administration
export default function AdminPanel() {
  const [showDocumentManagement, setShowDocumentManagement] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showCancellationModal, setShowCancellationModal] = useState(false)

  const handleViewDocuments = (application) => {
    setSelectedApplication(application)
    setShowDocumentManagement(true)
  }

  const handleCancelApplication = (application) => {
    setSelectedApplication(application)
    setShowCancellationModal(true)
  }

  const handleCancellationSuccess = () => {
    // Refresh data or update state as needed
    setShowCancellationModal(false)
    setSelectedApplication(null)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Administration Zitouna Tamkeen</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs, guides et demandes
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              onViewDocuments={handleViewDocuments}
              onCancelApplication={handleCancelApplication}
            />
          </TabsContent>

          <TabsContent value="guides">
            <GuideManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>

        {/* Document Management Modal */}
        {showDocumentManagement && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <DocumentManagement 
                applicationId={selectedApplication.id}
                onClose={() => {
                  setShowDocumentManagement(false)
                  setSelectedApplication(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        <CancellationModal
          application={selectedApplication}
          isOpen={showCancellationModal}
          onClose={() => {
            setShowCancellationModal(false)
            setSelectedApplication(null)
          }}
          onSuccess={handleCancellationSuccess}
        />
      </div>
    </div>
  )
}

