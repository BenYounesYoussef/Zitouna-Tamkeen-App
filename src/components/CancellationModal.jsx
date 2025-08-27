import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  X, 
  AlertTriangle, 
  Send,
  Clock,
  FileX,
  UserX,
  Ban
} from 'lucide-react'

// Predefined cancellation reasons
const CANCELLATION_REASONS = {
  fr: [
    {
      id: 'incomplete_documents',
      label: 'Documents incomplets',
      template: 'Votre demande a été annulée car les documents fournis sont incomplets ou non conformes. Veuillez rassembler tous les documents requis et soumettre une nouvelle demande.'
    },
    {
      id: 'eligibility_criteria',
      label: 'Critères d\'éligibilité non remplis',
      template: 'Après examen, votre profil ne répond pas aux critères d\'éligibilité pour ce service. Nous vous encourageons à consulter nos autres services qui pourraient mieux correspondre à votre situation.'
    },
    {
      id: 'duplicate_application',
      label: 'Demande en double',
      template: 'Une demande similaire a déjà été soumise pour votre compte. Veuillez vérifier le statut de votre demande existante ou nous contacter pour plus d\'informations.'
    },
    {
      id: 'expired_documents',
      label: 'Documents expirés',
      template: 'Les documents fournis ont expiré. Veuillez mettre à jour vos documents et soumettre une nouvelle demande avec des pièces justificatives valides.'
    },
    {
      id: 'customer_request',
      label: 'Demande du client',
      template: 'Votre demande a été annulée à votre demande. Vous pouvez soumettre une nouvelle demande à tout moment si vous souhaitez reprendre le processus.'
    },
    {
      id: 'technical_issues',
      label: 'Problèmes techniques',
      template: 'En raison de problèmes techniques, nous devons annuler votre demande. Veuillez soumettre une nouvelle demande et nous nous excusons pour ce désagrément.'
    },
    {
      id: 'other',
      label: 'Autre raison',
      template: ''
    }
  ],
  ar: [
    {
      id: 'incomplete_documents',
      label: 'وثائق غير مكتملة',
      template: 'تم إلغاء طلبك لأن الوثائق المقدمة غير مكتملة أو غير مطابقة. يرجى جمع جميع الوثائق المطلوبة وتقديم طلب جديد.'
    },
    {
      id: 'eligibility_criteria',
      label: 'معايير الأهلية غير مستوفاة',
      template: 'بعد المراجعة، لا يلبي ملفك الشخصي معايير الأهلية لهذه الخدمة. نشجعك على استكشاف خدماتنا الأخرى التي قد تناسب وضعك بشكل أفضل.'
    },
    {
      id: 'duplicate_application',
      label: 'طلب مكرر',
      template: 'تم تقديم طلب مماثل بالفعل لحسابك. يرجى التحقق من حالة طلبك الحالي أو الاتصال بنا للحصول على مزيد من المعلومات.'
    },
    {
      id: 'expired_documents',
      label: 'وثائق منتهية الصلاحية',
      template: 'الوثائق المقدمة منتهية الصلاحية. يرجى تحديث وثائقك وتقديم طلب جديد بمستندات صالحة.'
    },
    {
      id: 'customer_request',
      label: 'طلب العميل',
      template: 'تم إلغاء طلبك بناءً على طلبك. يمكنك تقديم طلب جديد في أي وقت إذا كنت ترغب في استئناف العملية.'
    },
    {
      id: 'technical_issues',
      label: 'مشاكل تقنية',
      template: 'بسبب مشاكل تقنية، يجب علينا إلغاء طلبك. يرجى تقديم طلب جديد ونعتذر عن هذا الإزعاج.'
    },
    {
      id: 'other',
      label: 'سبب آخر',
      template: ''
    }
  ]
}

// API helper function
const api = {
  cancelApplication: async (applicationId, reason, customMessage, language = 'fr') => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/applications/${applicationId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        reason: customMessage || reason,
        language: language 
      })
    })
    if (!response.ok) throw new Error('Failed to cancel application')
    return response.json()
  }
}

function CancellationModal({ application, isOpen, onClose, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [language, setLanguage] = useState('fr')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCustomMessage, setShowCustomMessage] = useState(false)

  if (!isOpen || !application) return null

  const reasons = CANCELLATION_REASONS[language] || CANCELLATION_REASONS.fr
  const selectedReasonData = reasons.find(r => r.id === selectedReason)

  const handleReasonChange = (reasonId) => {
    setSelectedReason(reasonId)
    const reasonData = reasons.find(r => r.id === reasonId)
    
    if (reasonId === 'other') {
      setShowCustomMessage(true)
      setCustomMessage('')
    } else {
      setShowCustomMessage(false)
      setCustomMessage(reasonData?.template || '')
    }
  }

  const handleCancel = async () => {
    if (!selectedReason) {
      setError('Veuillez sélectionner une raison d\'annulation')
      return
    }

    if (selectedReason === 'other' && !customMessage.trim()) {
      setError('Veuillez saisir un message personnalisé')
      return
    }

    try {
      setLoading(true)
      setError('')

      const finalMessage = selectedReason === 'other' ? customMessage : selectedReasonData?.template
      
      await api.cancelApplication(application.id, selectedReasonData?.label, finalMessage, language)
      
      onSuccess?.()
      onClose()
      
    } catch (error) {
      console.error('Error cancelling application:', error)
      setError('Erreur lors de l\'annulation de la demande')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedReason('')
    setCustomMessage('')
    setShowCustomMessage(false)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-destructive">
                <Ban className="h-5 w-5 mr-2" />
                Annuler la Demande
              </CardTitle>
              <CardDescription>
                Demande #{application.tracking_id} - {application.service_type}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Application Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Informations de la Demande</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Client:</span>
                <div className="font-medium">{application.user?.first_name} {application.user?.last_name}</div>
                <div className="text-muted-foreground">{application.user?.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Soumise le:</span>
                <div className="font-medium">
                  {new Date(application.submitted_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-muted-foreground">
                  Statut: {application.status}
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <Label htmlFor="language-select">Langue de Notification</Label>
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

          {/* Reason Selection */}
          <div>
            <Label htmlFor="reason-select">Raison de l'Annulation</Label>
            <Select value={selectedReason} onValueChange={handleReasonChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une raison" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Preview/Custom Message */}
          {selectedReason && (
            <div>
              <Label htmlFor="message">
                {showCustomMessage ? 'Message Personnalisé' : 'Aperçu du Message'}
              </Label>
              {showCustomMessage ? (
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Rédigez votre message d'annulation personnalisé..."
                  rows={4}
                  className="mt-2"
                />
              ) : (
                <div className="p-3 bg-muted rounded-lg text-sm mt-2">
                  {selectedReasonData?.template || 'Aucun message prédéfini'}
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention:</strong> Cette action est irréversible. Le client recevra une notification 
              par email et ne pourra plus modifier cette demande. Il devra soumettre une nouvelle demande 
              s'il souhaite reprendre le processus.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={loading || !selectedReason}
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Annulation...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Confirmer l'Annulation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CancellationModal

