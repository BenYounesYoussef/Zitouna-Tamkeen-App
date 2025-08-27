import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Send,
  Eye,
  Download,
  X,
  MessageSquare
} from 'lucide-react'

// Document status templates in multiple languages
const DOCUMENT_TEMPLATES = {
  fr: {
    missing: "Le document [DOCUMENT_NAME] est manquant ou illisible. Veuillez le retélécharger en format PDF ou JPG clair.",
    invalid: "Le document [DOCUMENT_NAME] n'est pas valide ou ne correspond pas aux critères requis. Veuillez vérifier et retélécharger un document conforme.",
    expired: "Le document [DOCUMENT_NAME] a expiré. Veuillez fournir un document à jour.",
    unclear: "Le document [DOCUMENT_NAME] n'est pas suffisamment clair. Veuillez retélécharger une version de meilleure qualité."
  },
  ar: {
    missing: "الوثيقة [DOCUMENT_NAME] مفقودة أو غير واضحة. يرجى إعادة تحميلها بصيغة PDF أو JPG واضحة.",
    invalid: "الوثيقة [DOCUMENT_NAME] غير صالحة أو لا تتوافق مع المعايير المطلوبة. يرجى التحقق وإعادة تحميل وثيقة مطابقة.",
    expired: "الوثيقة [DOCUMENT_NAME] منتهية الصلاحية. يرجى تقديم وثيقة محدثة.",
    unclear: "الوثيقة [DOCUMENT_NAME] غير واضحة بما فيه الكفاية. يرجى إعادة تحميل نسخة بجودة أفضل."
  }
}

const DOCUMENT_TYPES = [
  { id: 'cin', name: 'Carte d\'identité nationale', nameAr: 'بطاقة الهوية الوطنية' },
  { id: 'income_proof', name: 'Justificatif de revenus', nameAr: 'مبرر الدخل' },
  { id: 'bank_statement', name: 'Relevé bancaire', nameAr: 'كشف حساب بنكي' },
  { id: 'business_license', name: 'Licence commerciale', nameAr: 'رخصة تجارية' },
  { id: 'tax_certificate', name: 'Certificat fiscal', nameAr: 'شهادة ضريبية' },
  { id: 'residence_proof', name: 'Justificatif de domicile', nameAr: 'مبرر السكن' }
]

const ISSUE_TYPES = [
  { id: 'missing', label: 'Manquant', labelAr: 'مفقود', color: 'destructive' },
  { id: 'invalid', label: 'Non valide', labelAr: 'غير صالح', color: 'destructive' },
  { id: 'expired', label: 'Expiré', labelAr: 'منتهي الصلاحية', color: 'secondary' },
  { id: 'unclear', label: 'Illisible', labelAr: 'غير واضح', color: 'secondary' }
]

// API helper functions
const api = {
  getApplicationDocuments: async (applicationId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch documents')
    return response.json()
  },

  markDocumentMissing: async (applicationId, documentName, issueType, language = 'fr') => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/mark-missing-doc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        document_name: documentName,
        issue_type: issueType,
        language: language 
      })
    })
    if (!response.ok) throw new Error('Failed to mark document issue')
    return response.json()
  },

  sendCustomerMessage: async (applicationId, message, messageType = 'document_issue') => {
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

  getApplicationMessages: async (applicationId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to fetch messages')
    return response.json()
  }
}

function DocumentManagement({ applicationId, onClose }) {
  const [documents, setDocuments] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [issueType, setIssueType] = useState('')
  const [language, setLanguage] = useState('fr')
  const [customMessage, setCustomMessage] = useState('')
  const [showCustomMessage, setShowCustomMessage] = useState(false)

  useEffect(() => {
    if (applicationId) {
      loadDocuments()
      loadMessages()
    }
  }, [applicationId])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.getApplicationDocuments(applicationId)
      setDocuments(response.documents || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await api.getApplicationMessages(applicationId)
      setMessages(response.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleMarkDocumentIssue = async () => {
    if (!selectedDocument || !issueType) return

    try {
      const documentType = DOCUMENT_TYPES.find(type => type.id === selectedDocument.type)
      const documentName = language === 'ar' ? documentType?.nameAr : documentType?.name
      
      await api.markDocumentMissing(applicationId, documentName, issueType, language)
      
      // Reload documents and messages
      await loadDocuments()
      await loadMessages()
      
      // Reset form
      setSelectedDocument(null)
      setIssueType('')
      setError('')
      
    } catch (error) {
      console.error('Error marking document issue:', error)
      setError('Erreur lors du marquage du document')
    }
  }

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) return

    try {
      await api.sendCustomerMessage(applicationId, customMessage, 'custom')
      
      // Reload messages
      await loadMessages()
      
      // Reset form
      setCustomMessage('')
      setShowCustomMessage(false)
      setError('')
      
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Erreur lors de l\'envoi du message')
    }
  }

  const generateTemplateMessage = (documentName, issueType, language) => {
    const template = DOCUMENT_TEMPLATES[language]?.[issueType]
    return template ? template.replace('[DOCUMENT_NAME]', documentName) : ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gestion des Documents</h3>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Fermer
        </Button>
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents Soumis</CardTitle>
          <CardDescription>
            Vérifiez les documents et marquez ceux qui sont manquants ou invalides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun document soumis pour cette demande
              </p>
            ) : (
              documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.type} • {doc.size} • {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.status && (
                      <Badge variant={doc.status === 'approved' ? 'default' : 'destructive'}>
                        {doc.status === 'approved' ? 'Approuvé' : 'Problème'}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mark Document Issue */}
      <Card>
        <CardHeader>
          <CardTitle>Marquer un Problème de Document</CardTitle>
          <CardDescription>
            Sélectionnez un document et le type de problème pour générer un message automatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document-select">Type de Document</Label>
              <Select onValueChange={(value) => setSelectedDocument({ type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un document" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue-select">Type de Problème</Label>
              <Select onValueChange={setIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un problème" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map((issue) => (
                    <SelectItem key={issue.id} value={issue.id}>
                      {issue.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="language-select">Langue du Message</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedDocument && issueType && (
            <div>
              <Label>Aperçu du Message</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {generateTemplateMessage(
                  language === 'ar' 
                    ? DOCUMENT_TYPES.find(t => t.id === selectedDocument.type)?.nameAr
                    : DOCUMENT_TYPES.find(t => t.id === selectedDocument.type)?.name,
                  issueType,
                  language
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={handleMarkDocumentIssue}
            disabled={!selectedDocument || !issueType}
            className="w-full"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Marquer le Problème et Envoyer le Message
          </Button>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Message Personnalisé</CardTitle>
          <CardDescription>
            Envoyer un message personnalisé au client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCustomMessage ? (
            <Button 
              variant="outline" 
              onClick={() => setShowCustomMessage(true)}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Rédiger un Message Personnalisé
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-message">Message</Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Rédigez votre message personnalisé..."
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSendCustomMessage} disabled={!customMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCustomMessage(false)
                    setCustomMessage('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Messages</CardTitle>
          <CardDescription>
            Messages envoyés au client concernant cette demande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun message envoyé
              </p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={message.type === 'document_issue' ? 'destructive' : 'default'}>
                      {message.type === 'document_issue' ? 'Problème Document' : 'Message'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.sent_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DocumentManagement

