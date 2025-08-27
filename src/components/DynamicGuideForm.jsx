import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Save
} from 'lucide-react'
import { useAuth } from '../App.jsx'

const API_BASE_URL = '/api'

// File Upload Component
function FileUpload({ field, value, onChange, error }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = field.accept ? field.accept.split(',').map(t => t.trim()) : ['.pdf', '.jpg', '.jpeg', '.png']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      alert(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`)
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux. Taille maximale: 5MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', field.name)

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/upload/document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      onChange(result.file)
      setUploadProgress(100)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors du téléchargement: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
        {field.label}
      </Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {value ? (
          <div className="space-y-2">
            <FileText className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-sm font-medium text-green-600">
              {value.original_filename}
            </p>
            <p className="text-xs text-gray-500">
              {(value.file_size / 1024).toFixed(1)} KB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(null)}
            >
              Supprimer
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div>
              <label
                htmlFor={field.name}
                className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
              >
                Cliquez pour télécharger
              </label>
              <input
                id={field.name}
                type="file"
                className="hidden"
                accept={field.accept}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
            <p className="text-xs text-gray-500">
              {field.accept || 'PDF, JPG, PNG'} - Max 5MB
            </p>
          </div>
        )}
        
        {uploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">Téléchargement...</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Form Field Component
function FormField({ field, value, onChange, error }) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
            {field.label}
          </Label>
          <Input
            id={field.name}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
            {field.label}
          </Label>
          <Input
            id={field.name}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )

    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
            {field.label}
          </Label>
          <Input
            id={field.name}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
            {field.label}
          </Label>
          <Textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
            {field.label}
          </Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Sélectionnez une option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={value || false}
            onCheckedChange={onChange}
            className={error ? 'border-red-500' : ''}
          />
          <Label
            htmlFor={field.name}
            className={`text-sm ${field.required ? 'required' : ''} ${error ? 'text-red-600' : ''}`}
          >
            {field.label}
          </Label>
        </div>
      )

    case 'file':
      return (
        <FileUpload
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      )

    default:
      return null
  }
}

export default function DynamicGuideForm() {
  const { guideId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [guide, setGuide] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saveProgress, setSaveProgress] = useState(false)

  // Load guide data
  useEffect(() => {
    const loadGuide = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/guides/${guideId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        
        if (!response.ok) {
          throw new Error('Guide not found')
        }
        
        const guideData = await response.json()
        setGuide(guideData)
        
        // Load saved progress from localStorage
        const savedData = localStorage.getItem(`guide_progress_${guideId}`)
        if (savedData) {
          const parsed = JSON.parse(savedData)
          setFormData(parsed.formData || {})
          setCurrentStep(parsed.currentStep || 0)
        }
      } catch (error) {
        console.error('Error loading guide:', error)
        alert('Erreur lors du chargement du guide')
        navigate('/guides')
      } finally {
        setLoading(false)
      }
    }

    if (guideId) {
      loadGuide()
    }
  }, [guideId, navigate])

  // Save progress to localStorage
  useEffect(() => {
    if (guide && Object.keys(formData).length > 0) {
      const progressData = {
        formData,
        currentStep,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(`guide_progress_${guideId}`, JSON.stringify(progressData))
    }
  }, [formData, currentStep, guideId, guide])

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }))
    }
  }

  const validateStep = (stepIndex) => {
    const step = guide.steps[stepIndex]
    const stepErrors = {}
    
    step.fields?.forEach(field => {
      if (field.required && !formData[field.name]) {
        stepErrors[field.name] = 'Ce champ est requis'
      }
      
      // Additional validation based on field type
      if (formData[field.name]) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData[field.name])) {
              stepErrors[field.name] = 'Format email invalide'
            }
            break
          case 'tel':
            const phoneRegex = /^(\+216)?[2-9]\d{7}$/
            if (!phoneRegex.test(formData[field.name].replace(/\s/g, ''))) {
              stepErrors[field.name] = 'Format téléphone invalide'
            }
            break
        }
      }
    })
    
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, guide.steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    // Validate all steps
    let allValid = true
    for (let i = 0; i < guide.steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false
        break
      }
    }

    if (!allValid) {
      alert('Veuillez corriger les erreurs avant de soumettre')
      return
    }

    setSubmitting(true)
    
    try {
      const applicationData = {
        guide_id: guide.id,
        service_type: guide.service_type,
        form_data: formData,
        documents: Object.values(formData).filter(value => 
          value && typeof value === 'object' && value.file_url
        )
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Submission failed')
      }

      const result = await response.json()
      
      // Clear saved progress
      localStorage.removeItem(`guide_progress_${guideId}`)
      
      // Navigate to success page with tracking ID
      navigate(`/application-success/${result.application.tracking_id}`)
      
    } catch (error) {
      console.error('Submission error:', error)
      alert('Erreur lors de la soumission: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveProgress = () => {
    setSaveProgress(true)
    setTimeout(() => setSaveProgress(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement du guide...</p>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Guide non trouvé. Veuillez vérifier le lien ou contacter le support.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentStepData = guide.steps[currentStep]
  const progress = ((currentStep + 1) / guide.steps.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{guide.title}</h1>
            <p className="text-muted-foreground">{guide.description}</p>
          </div>
          <Badge variant="outline">
            Étape {currentStep + 1} sur {guide.steps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="w-full" />
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-muted-foreground">
            Progression: {Math.round(progress)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveProgress}
            disabled={saveProgress}
          >
            <Save className="h-4 w-4 mr-1" />
            {saveProgress ? 'Sauvegardé' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Current Step */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              {currentStep + 1}
            </span>
            {currentStepData.title}
          </CardTitle>
          {currentStepData.description && (
            <CardDescription>{currentStepData.description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.fields?.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={(value) => handleFieldChange(field.name, value)}
              error={errors[field.name]}
            />
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
        
        <div className="flex space-x-2">
          {currentStep === guide.steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Soumission...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Soumettre la demande
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

