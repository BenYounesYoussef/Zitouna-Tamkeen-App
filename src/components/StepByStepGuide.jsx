import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image,
  Download
} from 'lucide-react'

// Données d'exemple pour un guide de microfinancement
const guideData = {
  id: 1,
  titre: "Demande de Microfinancement",
  description: "Guide complet pour soumettre votre demande de financement conforme à la Charia",
  etapes: [
    {
      id: 1,
      titre: "Informations Personnelles",
      description: "Fournissez vos informations personnelles de base",
      instructions: "Veuillez remplir tous les champs obligatoires avec des informations exactes et à jour.",
      documentsRequis: [
        {
          id: 1,
          nom: "Carte d'identité nationale",
          description: "Copie recto-verso de votre CIN en cours de validité",
          obligatoire: true,
          formatAccepte: ["jpg", "png", "pdf"],
          tailleMax: 5
        },
        {
          id: 2,
          nom: "Justificatif de domicile",
          description: "Facture d'électricité, d'eau ou de téléphone récente (moins de 3 mois)",
          obligatoire: true,
          formatAccepte: ["jpg", "png", "pdf"],
          tailleMax: 5
        }
      ]
    },
    {
      id: 2,
      titre: "Projet d'Investissement",
      description: "Décrivez votre projet et vos besoins de financement",
      instructions: "Présentez votre projet de manière détaillée en expliquant la nature de l'activité, le marché cible et la rentabilité prévue.",
      documentsRequis: [
        {
          id: 3,
          nom: "Plan d'affaires",
          description: "Document détaillant votre projet, le marché, la concurrence et les projections financières",
          obligatoire: true,
          formatAccepte: ["pdf", "doc", "docx"],
          tailleMax: 10
        },
        {
          id: 4,
          nom: "Devis des équipements",
          description: "Devis détaillés des équipements ou matériels à acquérir",
          obligatoire: false,
          formatAccepte: ["jpg", "png", "pdf"],
          tailleMax: 5
        }
      ]
    },
    {
      id: 3,
      titre: "Situation Financière",
      description: "Fournissez des informations sur votre situation financière",
      instructions: "Ces documents nous permettront d'évaluer votre capacité de remboursement et d'adapter l'offre de financement à votre profil.",
      documentsRequis: [
        {
          id: 5,
          nom: "Relevés bancaires",
          description: "Relevés des 6 derniers mois de tous vos comptes bancaires",
          obligatoire: true,
          formatAccepte: ["pdf"],
          tailleMax: 10
        },
        {
          id: 6,
          nom: "Bulletins de salaire",
          description: "3 derniers bulletins de salaire si vous êtes salarié",
          obligatoire: false,
          formatAccepte: ["jpg", "png", "pdf"],
          tailleMax: 5
        }
      ]
    },
    {
      id: 4,
      titre: "Garanties",
      description: "Informations sur les garanties proposées",
      instructions: "Les garanties permettent de sécuriser le financement. Vous pouvez proposer des garanties personnelles ou réelles.",
      documentsRequis: [
        {
          id: 7,
          nom: "Acte de propriété",
          description: "Si vous proposez un bien immobilier en garantie",
          obligatoire: false,
          formatAccepte: ["pdf"],
          tailleMax: 10
        },
        {
          id: 8,
          nom: "Attestation de garant",
          description: "Document signé par votre garant avec copie de sa CIN",
          obligatoire: false,
          formatAccepte: ["jpg", "png", "pdf"],
          tailleMax: 5
        }
      ]
    },
    {
      id: 5,
      titre: "Validation et Soumission",
      description: "Vérifiez vos informations et soumettez votre demande",
      instructions: "Relisez attentivement toutes les informations fournies avant de soumettre votre demande. Une fois soumise, vous recevrez un accusé de réception.",
      documentsRequis: []
    }
  ]
}

// Composant pour l'upload de fichiers
function FileUpload({ document, onFileUpload, uploadedFile }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Vérifier la taille du fichier
      if (file.size > document.tailleMax * 1024 * 1024) {
        alert(`Le fichier est trop volumineux. Taille maximale: ${document.tailleMax}MB`)
        return
      }
      
      // Vérifier le format
      const extension = file.name.split('.').pop().toLowerCase()
      if (!document.formatAccepte.includes(extension)) {
        alert(`Format non accepté. Formats acceptés: ${document.formatAccepte.join(', ')}`)
        return
      }
      
      onFileUpload(document.id, file)
    }
  }

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-4">
      <div className="text-center">
        {uploadedFile ? (
          <div className="space-y-2">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-green-700">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              Fichier uploadé avec succès
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <Label htmlFor={`file-${document.id}`} className="cursor-pointer">
                <span className="text-sm font-medium text-primary hover:underline">
                  Cliquez pour uploader
                </span>
                <span className="text-sm text-muted-foreground"> ou glissez-déposez</span>
              </Label>
              <Input
                id={`file-${document.id}`}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={document.formatAccepte.map(ext => `.${ext}`).join(',')}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Formats acceptés: {document.formatAccepte.join(', ')} (max {document.tailleMax}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant principal du guide étape par étape
export default function StepByStepGuide({ guideId = 1, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [formData, setFormData] = useState({})

  const guide = guideData // En production, ceci viendrait d'une API
  const totalSteps = guide.etapes.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleFileUpload = (documentId, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentId]: file
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Logique de soumission
    console.log('Soumission de la demande:', { formData, uploadedFiles })
    if (onComplete) {
      onComplete()
    }
  }

  const isStepComplete = (stepIndex) => {
    const step = guide.etapes[stepIndex]
    const requiredDocs = step.documentsRequis.filter(doc => doc.obligatoire)
    return requiredDocs.every(doc => uploadedFiles[doc.id])
  }

  const canProceed = () => {
    return isStepComplete(currentStep)
  }

  const currentStepData = guide.etapes[currentStep]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec progression */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{guide.titre}</h1>
          <p className="text-muted-foreground">{guide.description}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Étape {currentStep + 1} sur {totalSteps}</span>
            <span>{Math.round(progress)}% complété</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-between">
          {guide.etapes.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs text-center max-w-20">{step.titre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape actuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Étape {currentStep + 1}: {currentStepData.titre}</span>
            {isStepComplete(currentStep) && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Instructions</h4>
                <p className="text-sm text-blue-700">{currentStepData.instructions}</p>
              </div>
            </div>
          </div>

          {/* Documents requis */}
          {currentStepData.documentsRequis.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documents Requis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.documentsRequis.map((document) => (
                  <Card key={document.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <CardTitle className="text-base">{document.nom}</CardTitle>
                            <CardDescription className="text-sm">
                              {document.description}
                            </CardDescription>
                          </div>
                        </div>
                        {document.obligatoire && (
                          <Badge variant="destructive" className="text-xs">
                            Obligatoire
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FileUpload
                        document={document}
                        onFileUpload={handleFileUpload}
                        uploadedFile={uploadedFiles[document.id]}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire pour l'étape finale */}
          {currentStep === totalSteps - 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Récapitulatif</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Votre dossier est complet et prêt à être soumis
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Vous recevrez un accusé de réception par email dans les 24 heures.
                  Le traitement de votre demande prendra entre 5 à 10 jours ouvrables.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        {currentStep === totalSteps - 1 ? (
          <Button 
            onClick={handleSubmit}
            disabled={!canProceed()}
            className="bg-green-600 hover:bg-green-700"
          >
            Soumettre la Demande
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Aide */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Besoin d'aide ?</h4>
              <p className="text-sm text-muted-foreground">
                Contactez notre équipe au +216 70 248 848 ou par email à support@zitounatamkeen.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

