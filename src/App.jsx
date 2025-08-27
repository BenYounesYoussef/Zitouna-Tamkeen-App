import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import {
  Home,
  FileText,
  User,
  Settings,
  Menu,
  X,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Shield,
  UserCog,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import logoFidelity from './assets/logo_fidelity.svg'
import AdminPanel from './components/AdminPanel.jsx'
import StepByStepGuide from './components/StepByStepGuide.jsx'
import DynamicGuideForm from './components/DynamicGuideForm.jsx'
import AuthForm from './components/AuthForm.jsx'
import UserProfile from './components/UserProfile.jsx'
import DocumentUploadWizard from './components/DocumentUploadWizard.jsx'
import './App.css'

// API Configuration
const API_BASE_URL = 'https://60h5imc0qk8p.manus.space/api'

// Authentication Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// API Helper Functions
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token')
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }))
        throw new Error(error.error || `Request failed with status ${response.status}`)
      }

      return response.json()
    } catch (error) {
      // Enhanced error handling for mobile network issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.')
      }
      throw error
    }
  },

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async verifyToken() {
    return this.request('/auth/verify-token')
  },

  // Guide endpoints
  async getGuides() {
    return this.request('/guides/')
  },

  async getGuide(guideId) {
    return this.request(`/guides/${guideId}`)
  },

  // Application endpoints
  async submitApplication(applicationData) {
    return this.request('/applications/submit', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })
  },

  async getUserApplications() {
    return this.request('/applications/')
  },

  async getApplicationStatistics() {
    return this.request('/applications/statistics')
  }
}

// Authentication Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.verifyToken()
        .then(response => {
          setUser(response.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const response = await api.login(credentials)
    localStorage.setItem('token', response.token)
    setUser(response.user)
    return response
  }

  const signup = async (userData) => {
    const response = await api.signup(userData)
    localStorage.setItem('token', response.token)
    setUser(response.user)
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Composant Header avec logo animé
function Header({ isMobile, toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    logout()
    navigate('/auth')
  }

  const handleLoginClick = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    navigate('/auth')
  }

  return (
    <header className="bg-white border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar} 
            aria-label="Toggle navigation menu"
            className="mr-2"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
        <img 
          src={logoFidelity} 
          alt="Zitouna Tamkeen" 
          className="h-10 w-10 zitouna-logo logo-animation"
        />
        <div>
          <h1 className="text-xl font-bold text-primary">Zitouna Tamkeen</h1>
          <p className="text-sm text-muted-foreground">Microfinance</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground hidden md:inline">
              Bonjour, {user.first_name || user.username}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={handleLoginClick}>
            Connexion
          </Button>
        )}
      </div>
    </header>
  )
}

// Composant Navigation Desktop
function DesktopSidebar({ currentPath }) {
  const { user } = useAuth()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/guides', icon: FileText, label: 'Guides' },
    { path: '/profile', icon: User, label: 'Profil' },
    ...(user?.is_admin ? [{ path: '/admin', icon: UserCog, label: 'Administration' }] : []),
    { path: '/settings', icon: Settings, label: 'Paramètres' }
  ]

  return (
    <div className="desktop-sidebar hidden md:block">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <img 
            src={logoFidelity} 
            alt="Zitouna Tamkeen" 
            className="h-8 w-8 zitouna-logo"
          />
          <div>
            <h2 className="font-semibold text-primary">Zitouna Tamkeen</h2>
            <p className="text-xs text-muted-foreground">Microfinance</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentPath === item.path 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

// Composant Navigation Mobile
function MobileNavigation({ currentPath, isOpen, toggleSidebar }) {
  const { user } = useAuth()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/guides', icon: FileText, label: 'Guides' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/settings', icon: Settings, label: 'Paramètres' }
  ]

  const adminNavItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/guides', icon: FileText, label: 'Guides' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/admin', icon: UserCog, label: 'Admin' },
    { path: '/settings', icon: Settings, label: 'Paramètres' }
  ]

  const sidebarItems = user?.is_admin ? adminNavItems : navItems
  const bottomNavItems = navItems.slice(0, 4) // Always show 4 items in bottom nav

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      
      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isOpen ? 'show' : ''}`}>
        <div className="mobile-sidebar-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={logoFidelity} 
                alt="Zitouna Tamkeen" 
                className="h-8 w-8 zitouna-logo"
              />
              <div>
                <h2 className="font-semibold text-primary">Zitouna Tamkeen</h2>
                <p className="text-xs text-muted-foreground">Microfinance</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSidebar}
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <nav className="mobile-sidebar-nav">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-sidebar-nav-item ${
                currentPath === item.path ? 'active' : ''
              }`}
              aria-current={currentPath === item.path ? 'page' : undefined}
              onClick={toggleSidebar}
            >
              <item.icon className="h-5 w-5 icon" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          {user && (
            <div className="border-t border-border mt-4 pt-4">
              <div className="px-4 py-2">
                <p className="text-sm font-medium">
                  {user.first_name || user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="mobile-nav">
        <div className="flex justify-around py-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${
                currentPath === item.path ? 'active' : ''
              }`}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5 icon" />
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

// Page d'accueil
function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [expandedService, setExpandedService] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState({})

  const services = [
    {
      id: 'microfinancement',
      title: 'Microfinancement',
      description: 'Financements conformes à la Charia pour vos projets',
      details: 'Obtenez un financement jusqu\'à 50,000 TND pour développer votre activité économique. Nos solutions respectent les principes de la finance islamique avec des conditions avantageuses et un accompagnement personnalisé.',
      features: ['Montant jusqu\'à 50,000 TND', 'Durée flexible', 'Taux compétitifs', 'Accompagnement personnalisé'],
      steps: [
        {
          title: 'Évaluation',
          description: 'Analyse de votre projet et de votre capacité de remboursement',
          icon: '📋'
        },
        {
          title: 'Documentation',
          description: 'Collecte des documents nécessaires pour votre dossier',
          icon: '📄'
        },
        {
          title: 'Approbation',
          description: 'Validation par notre comité de crédit selon les principes islamiques',
          icon: '✅'
        },
        {
          title: 'Déblocage',
          description: 'Mise à disposition des fonds selon les modalités convenues',
          icon: '💰'
        }
      ]
    },
    {
      id: 'microtakaful',
      title: 'MicroTakaful',
      description: 'Protection islamique pour vos investissements',
      details: 'Protégez vos investissements et votre famille avec notre système d\'assurance islamique. Le MicroTakaful offre une couverture complète basée sur les principes de solidarité et de partage des risques.',
      features: ['Couverture familiale', 'Principes islamiques', 'Cotisations abordables', 'Solidarité communautaire'],
      steps: [
        {
          title: 'Souscription',
          description: 'Adhésion au fonds de solidarité selon vos besoins',
          icon: '🤝'
        },
        {
          title: 'Cotisation',
          description: 'Versement de votre contribution au fonds commun',
          icon: '💳'
        },
        {
          title: 'Protection',
          description: 'Bénéficiez de la couverture en cas de sinistre',
          icon: '🛡️'
        }
      ]
    }
  ]

  const handleStartApplication = async (e) => {
    // Prevent any event bubbling that might trigger mobile menu
    e?.preventDefault()
    e?.stopPropagation()
    
    setIsLoading(true)
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false)
      if (user) {
        navigate('/demande/step-1')
      } else {
        navigate('/login')
      }
    }, 500)
  }

  const toggleServiceDetails = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
    // Reset step index when collapsing
    if (expandedService === serviceId) {
      setCurrentStepIndex(prev => ({ ...prev, [serviceId]: 0 }))
    }
  }

  const nextStep = (serviceId) => {
    const service = services.find(s => s.id === serviceId)
    const currentIndex = currentStepIndex[serviceId] || 0
    if (currentIndex < service.steps.length - 1) {
      setCurrentStepIndex(prev => ({
        ...prev,
        [serviceId]: currentIndex + 1
      }))
    }
  }

  const prevStep = (serviceId) => {
    const currentIndex = currentStepIndex[serviceId] || 0
    if (currentIndex > 0) {
      setCurrentStepIndex(prev => ({
        ...prev,
        [serviceId]: currentIndex - 1
      }))
    }
  }

  return (
    <div className="space-y-6 mobile-fade-in">
      {/* Hero Section */}
      <div className="gradient-bg text-white rounded-lg p-4 md:p-8 text-center hero-section mobile-card">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 floating mobile-heading">
          Bienvenue chez Zitouna Tamkeen
        </h1>
        <p className="text-base md:text-lg mb-6 opacity-90 mobile-slide-in-left mobile-body">
          Première institution de microfinance islamique en Tunisie
        </p>
        <Button 
          variant="secondary" 
          size="lg" 
          className="mobile-button primary pulse-glow mobile-slide-in-right haptic-medium"
          onClick={handleStartApplication}
          disabled={isLoading}
          aria-label="Commencer votre demande de microfinance"
        >
          {isLoading ? (
            <div className="mobile-loading-spinner mr-2" />
          ) : null}
          {isLoading ? 'Chargement...' : 'Commencer votre demande'}
          {!isLoading && <ChevronRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="mobile-grid md:grid-cols-3 gap-4 stats-grid">
        <Card className="mobile-card haptic-light mobile-slide-in-left">
          <CardContent className="p-4 md:p-6 text-center mobile-spacing">
            <Users className="h-6 md:h-8 w-6 md:w-8 text-primary mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold mobile-heading">37,000+</h3>
            <p className="text-sm md:text-base text-muted-foreground mobile-caption">Bénéficiaires</p>
          </CardContent>
        </Card>
        <Card className="mobile-card haptic-light mobile-fade-in" style={{animationDelay: '0.1s'}}>
          <CardContent className="p-4 md:p-6 text-center mobile-spacing">
            <TrendingUp className="h-6 md:h-8 w-6 md:w-8 text-accent mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold mobile-heading">100M TND</h3>
            <p className="text-sm md:text-base text-muted-foreground mobile-caption">Financements</p>
          </CardContent>
        </Card>
        <Card className="mobile-card haptic-light mobile-slide-in-right" style={{animationDelay: '0.2s'}}>
          <CardContent className="p-4 md:p-6 text-center mobile-spacing">
            <Shield className="h-6 md:h-8 w-6 md:w-8 text-secondary mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold mobile-heading">100%</h3>
            <p className="text-sm md:text-base text-muted-foreground mobile-caption">Conforme Charia</p>
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <div className="mobile-slide-in-up" style={{animationDelay: '0.3s'}}>
        <h2 className="text-xl md:text-2xl font-bold mb-4 mobile-heading">Nos Services</h2>
        <div className="mobile-grid md:grid-cols-2 gap-4 services-grid">
          {services.map((service, index) => (
            <Card key={service.id} className="mobile-card haptic-light service-card" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
              <CardHeader className="mobile-spacing">
                <CardTitle className="text-lg md:text-xl mobile-heading">{service.title}</CardTitle>
                <CardDescription className="text-sm md:text-base mobile-body">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="mobile-spacing">
                <Button 
                  variant="outline" 
                  className="w-full mb-3 mobile-button haptic-light touch-target"
                  onClick={() => toggleServiceDetails(service.id)}
                  aria-expanded={expandedService === service.id}
                  aria-controls={`service-details-${service.id}`}
                >
                  En savoir plus
                  {expandedService === service.id ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
                
                <div 
                  className={`service-expansion ${expandedService === service.id ? 'expanded' : ''}`}
                  id={`service-details-${service.id}`}
                >
                  <div className="expansion-content">
                    <p className="text-sm text-muted-foreground mobile-body mb-4">{service.details}</p>
                    
                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mobile-caption mb-2">Caractéristiques:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center mobile-caption">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps Carousel */}
                    {service.steps && service.steps.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mobile-caption mb-3">Processus:</h4>
                        <div className="steps-carousel">
                          <div className="steps-container">
                            <div 
                              className="steps-track"
                              style={{
                                transform: `translateX(-${(currentStepIndex[service.id] || 0) * 100}%)`
                              }}
                            >
                              {service.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className="step-card">
                                  <div className="step-icon">{step.icon}</div>
                                  <h5 className="step-title">{step.title}</h5>
                                  <p className="step-description">{step.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Navigation arrows */}
                          <div className="steps-navigation">
                            <button
                              className="step-nav-btn prev"
                              onClick={() => prevStep(service.id)}
                              disabled={(currentStepIndex[service.id] || 0) === 0}
                              aria-label="Étape précédente"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            
                            <div className="steps-indicators">
                              {service.steps.map((_, stepIndex) => (
                                <button
                                  key={stepIndex}
                                  className={`step-indicator ${(currentStepIndex[service.id] || 0) === stepIndex ? 'active' : ''}`}
                                  onClick={() => setCurrentStepIndex(prev => ({ ...prev, [service.id]: stepIndex }))}
                                  aria-label={`Aller à l'étape ${stepIndex + 1}`}
                                />
                              ))}
                            </div>
                            
                            <button
                              className="step-nav-btn next"
                              onClick={() => nextStep(service.id)}
                              disabled={(currentStepIndex[service.id] || 0) === service.steps.length - 1}
                              aria-label="Étape suivante"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      className="w-full mobile-button primary haptic-medium touch-target"
                      onClick={handleStartApplication}
                      disabled={isLoading}
                      aria-label={`Commencer une demande pour ${service.title}`}
                    >
                      {isLoading ? (
                        <div className="mobile-loading-spinner mr-2" />
                      ) : null}
                      {isLoading ? 'Chargement...' : 'Commencer une demande'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden">
        <button 
          className="fab haptic-heavy"
          onClick={handleStartApplication}
          disabled={isLoading}
          aria-label="Commencer votre demande rapidement"
        >
          {isLoading ? (
            <div className="mobile-loading-spinner" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  )
}

// Page des guides
function GuidesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const response = await api.getGuides()
        setGuides(response.guides || [])
      } catch (error) {
        console.error('Error loading guides:', error)
        setError('Erreur lors du chargement des guides')
      } finally {
        setLoading(false)
      }
    }

    loadGuides()
  }, [])

  const handleStartGuide = (guideId) => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: `/guide/${guideId}` } } })
      return
    }
    navigate(`/guide/${guideId}`)
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

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Guides Étape par Étape</h1>
        <p className="text-muted-foreground">
          Suivez nos guides pour compléter vos demandes facilement
        </p>
      </div>

      {guides.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun guide disponible pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <Card key={guide.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {guide.steps?.length || 0} étapes
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {guide.estimated_duration ? `${guide.estimated_duration} min` : '15-20 min'}
                  </span>
                </div>
                <CardTitle className="text-lg">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleStartGuide(guide.id)}
                  aria-label={`Commencer le guide ${guide.title}`}
                >
                  Commencer le guide
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Page des paramètres
function SettingsPage() {
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-3xl font-bold mb-4">Paramètres</h1>
      <Card>
        <CardHeader>
          <CardTitle>Préférences de notification</CardTitle>
          <CardDescription>Gérez comment vous recevez les notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for notification settings */}
          <p className="text-muted-foreground">Les options de notification seront disponibles ici.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Gérez vos paramètres de sécurité, y compris la 2FA.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for security settings */}
          <p className="text-muted-foreground">Les options de sécurité seront disponibles ici.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant principal de l'application avec Router
function AppContent() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      // Close sidebar when switching to desktop
      if (!mobile) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [currentPath, isMobile])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header isMobile={isMobile} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          {!isMobile && <DesktopSidebar currentPath={currentPath} />}

          {/* Main Content */}
          <main className={`flex-1 p-4 md:p-8 main-content ${!isMobile ? 'md:ml-64' : ''}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/guide/:guideId" element={<DynamicGuideForm />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/demande/step-1" element={<DocumentUploadWizard />} />
            </Routes>
          </main>
        </div>
        
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNavigation 
            currentPath={currentPath} 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
          />
        )}
      </div>
    </AuthProvider>
  )
}

// Main App component with Router wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

