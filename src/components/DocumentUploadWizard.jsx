import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Download
} from 'lucide-react'

const DocumentUploadWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    {
      id: 1,
      title: 'Documents d\'identité',
      description: 'Pièce d\'identité et justificatifs personnels'
    },
    {
      id: 2,
      title: 'Documents financiers',
      description: 'Relevés bancaires et justificatifs de revenus'
    },
    {
      id: 3,
      title: 'Documents du projet',
      description: 'Business plan et documents liés au projet'
    },
    {
      id: 4,
      title: 'Révision et soumission',
      description: 'Vérification finale et envoi de votre dossier'
    }
  ]

  const requiredDocuments = {
    1: [
      { id: 'cin', name: 'Carte d\'identité nationale', required: true },
      { id: 'passport', name: 'Passeport', required: false },
      { id: 'residence', name: 'Justificatif de domicile', required: true }
    ],
    2: [
      { id: 'bank_statement', name: 'Relevé bancaire (3 derniers mois)', required: true },
      { id: 'salary_slip', name: 'Bulletin de salaire', required: true },
      { id: 'tax_declaration', name: 'Déclaration fiscale', required: false }
    ],
    3: [
      { id: 'business_plan', name: 'Business plan', required: true },
      { id: 'project_budget', name: 'Budget prévisionnel', required: true },
      { id: 'market_study', name: 'Étude de marché', required: false }
    ]
  }

  const handleFileUpload = (documentId, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentId]: {
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      }
    }))
  }

  const handleRemoveFile = (documentId) => {
    setUploadedFiles(prev => {
      const updated = { ...prev }
      delete updated[documentId]
      return updated
    })
  }

  const canProceedToNext = () => {
    if (currentStep === 4) return false
    
    const stepDocs = requiredDocuments[currentStep] || []
    const requiredDocs = stepDocs.filter(doc => doc.required)
    
    return requiredDocs.every(doc => uploadedFiles[doc.id])
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Navigate to confirmation page or show success message
      alert('Votre dossier a été soumis avec succès! Vous recevrez une confirmation par email.')
      navigate('/')
    }, 2000)
  }

  const getStepProgress = () => {
    return (currentStep / steps.length) * 100
  }

  const FileUploadArea = ({ document }) => {
    const isUploaded = uploadedFiles[document.id]
    
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
        {isUploaded ? (
          <div className="space-y-3">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-green-700">{isUploaded.name}</p>
              <p className="text-sm text-gray-500">
                {(isUploaded.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveFile(document.id)}
              >
                Supprimer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.pdf,.jpg,.jpeg,.png'
                  input.onchange = (e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(document.id, e.target.files[0])
                    }
                  }
                  input.click()
                }}
              >
                Remplacer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="font-medium">{document.name}</p>
              {document.required && (
                <Badge variant="destructive" className="mt-1">Obligatoire</Badge>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,.jpg,.jpeg,.png'
                input.onchange = (e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(document.id, e.target.files[0])
                  }
                }
                input.click()
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choisir un fichier
            </Button>
            <p className="text-xs text-gray-500">
              PDF, JPG, PNG (max 10MB)
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Demande de Microfinancement</h1>
        <p className="text-muted-foreground">
          Suivez les étapes pour soumettre votre dossier complet
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Étape {currentStep} sur {steps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(getStepProgress())}% complété</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center p-2 rounded ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <div className="text-xs font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep <= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {requiredDocuments[currentStep]?.map((document) => (
              <div key={document.id}>
                <FileUploadArea document={document} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Review Step */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Révision et soumission
            </CardTitle>
            <CardDescription>
              Vérifiez vos documents avant de soumettre votre dossier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(requiredDocuments).map(([stepNum, docs]) => (
              <div key={stepNum} className="space-y-3">
                <h4 className="font-medium">{steps[parseInt(stepNum) - 1].title}</h4>
                <div className="grid gap-3">
                  {docs.map((doc) => {
                    const uploaded = uploadedFiles[doc.id]
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {uploaded ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                          )}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {uploaded && (
                              <p className="text-sm text-gray-500">{uploaded.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.required && (
                            <Badge variant={uploaded ? "default" : "destructive"}>
                              {uploaded ? "Fourni" : "Obligatoire"}
                            </Badge>
                          )}
                          {!doc.required && !uploaded && (
                            <Badge variant="secondary">Optionnel</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? () => navigate('/') : handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Retour à l\'accueil' : 'Précédent'}
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext()}
            className="flex items-center gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Soumission en cours...
              </>
            ) : (
              <>
                Soumettre le dossier
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default DocumentUploadWizard

