'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Edit, Plus, Search, Eye, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { UploadButton, UploadDropzone } from '@/lib/uploadthing'
import { CATEGORY_TEMPLATE } from '@/constants/size'

interface DesignTemplate {
    id: string
    title: string
    description: string
    imageUrl: string
    category: string
    tags: string[]
    isActive: boolean
    createdAt: string
    downloads: number
}

export default function DesignTemplatePage() {
    const [templates, setTemplates] = useState<DesignTemplate[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state - removed price
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        category: '',
        tags: ''
    })

    const categories = ['all', ...CATEGORY_TEMPLATE]

    // Mock data - removed price
    useEffect(() => {
        const mockTemplates: DesignTemplate[] = [
            {
                id: '1',
                title: 'Modern Logo Template',
                description: 'Clean and modern logo design perfect for startups',
                imageUrl: '/templates/logo-1.jpg',
                category: 'logo',
                tags: ['modern', 'minimal', 'startup'],
                isActive: true,
                createdAt: '2024-01-15',
                downloads: 156
            },
            {
                id: '2',
                title: 'Social Media Banner',
                description: 'Eye-catching banner for social media posts',
                imageUrl: '/templates/banner-1.jpg',
                category: 'banner',
                tags: ['social', 'colorful', 'trendy'],
                isActive: true,
                createdAt: '2024-01-20',
                downloads: 89
            }
        ]

        setTimeout(() => {
            setTemplates(mockTemplates)
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleAddTemplate = async () => {
        if (!formData.title || !formData.imageUrl || !formData.category) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await client.api['design-templates'].$post({
                json: {
                    name: formData.title,
                    description: formData.description,
                    imageUrl: formData.imageUrl,
                    category: formData.category as string,
                }
            })

            if (!response.ok) {
                throw new Error('Failed to create template')
            }

            const result = await response.json()
            toast.success("Template created successfully")
            setIsSubmitting(false)
            resetForm()
        } catch (error) {
            console.error('Error creating template:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditTemplate = () => {
        if (!selectedTemplate) return
        if (!formData.title || !formData.imageUrl || !formData.category) {
            toast.error("Please fill in all required fields")
            return
        }

        const updatedTemplates = templates.map(template =>
            template.id === selectedTemplate.id
                ? {
                    ...template,
                    title: formData.title,
                    description: formData.description,
                    imageUrl: formData.imageUrl,
                    category: formData.category,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                }
                : template
        )

        setTemplates(updatedTemplates)
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("Template updated successfully")
    }

    const handleDeleteTemplate = (id: string) => {
        setTemplates(templates.filter(template => template.id !== id))
        toast.success("Template deleted successfully")
    }

    const toggleTemplateStatus = (id: string) => {
        const updatedTemplates = templates.map(template =>
            template.id === id
                ? { ...template, isActive: !template.isActive }
                : template
        )
        setTemplates(updatedTemplates)
        toast.success("Template status updated")
    }

    const openEditDialog = (template: DesignTemplate) => {
        setSelectedTemplate(template)
        setFormData({
            title: template.title,
            description: template.description,
            imageUrl: template.imageUrl,
            category: template.category,
            tags: template.tags.join(', ')
        })
        setIsEditDialogOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            imageUrl: '',
            category: '',
            tags: ''
        })
        setSelectedTemplate(null)
    }

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, imageUrl: url }))
        toast.success("Image uploaded successfully!")
    }

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }))
    }

    const showListCateTemplate = (list: string[]) => {
        return list.map((item) => {
            return <SelectItem value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</SelectItem>
        })
    }

    // Template Form Component - removed price field
    const TemplateForm = ({ isEdit = false }: { isEdit?: boolean }) => (
        <div className="grid gap-4 py-4">
            <div>
                <Label htmlFor={isEdit ? "edit-title" : "title"}>
                    Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={isEdit ? "edit-title" : "title"}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter template title"
                    required
                />
            </div>

            <div>
                <Label htmlFor={isEdit ? "edit-description" : "description"}>Description</Label>
                <Textarea
                    id={isEdit ? "edit-description" : "description"}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Template description"
                    rows={3}
                />
            </div>

            {/* Image Upload Section */}
            <div>
                <Label>
                    Template Image <span className="text-red-500">*</span>
                </Label>

                {formData.imageUrl ? (
                    <div className="mt-2">
                        <div className="relative inline-block">
                            <Image
                                src={formData.imageUrl}
                                alt="Template preview"
                                width={200}
                                height={150}
                                className="rounded-lg border object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={removeImage}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Click the X to remove and upload a new image
                        </p>
                    </div>
                ) : (
                    <div className="mt-2">
                        {/* Option 1: Upload Button */}
                        <div className="mb-4">
                            <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]?.url) {
                                        handleImageUpload(res[0].url)
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Upload error: ${error.message}`)
                                }}
                                onUploadBegin={() => {
                                    setIsUploading(true)
                                }}
                                appearance={{
                                    button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed ut-uploading:bg-primary/50",
                                    allowedContent: "text-xs text-muted-foreground",
                                }}
                                content={{
                                    button: isUploading ? "Uploading..." : "Upload Image",
                                    allowedContent: "Max file size: 8MB"
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        {/* Option 2: Drag & Drop */}
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                            <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]?.url) {
                                        handleImageUpload(res[0].url)
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Upload error: ${error.message}`)
                                }}
                                onUploadBegin={() => {
                                    setIsUploading(true)
                                }}
                                appearance={{
                                    container: "border-none bg-transparent",
                                    uploadIcon: "text-muted-foreground",
                                    label: "text-sm text-muted-foreground",
                                    allowedContent: "text-xs text-muted-foreground",
                                }}
                                content={{
                                    label: "Drag & drop your image here",
                                    allowedContent: "PNG, JPG, JPEG (max 8MB)"
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div>
                <Label htmlFor={isEdit ? "edit-category" : "category"}>
                    Category <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {showListCateTemplate(CATEGORY_TEMPLATE)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Design Templates Management</h1>
                    <p className="text-gray-600 mt-2">Manage your system design templates</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Design Template</DialogTitle>
                            <DialogDescription>
                                Create a new design template for the system
                            </DialogDescription>
                        </DialogHeader>
                        <TemplateForm />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddTemplate}
                                disabled={!formData.title || !formData.imageUrl || !formData.category}
                            >
                                Add Template
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {showListCateTemplate(categories)}
                    </SelectContent>
                </Select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                <Image
                                    src={template.imageUrl}
                                    alt={template.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute top-2 right-2">
                                    <Badge variant={template.isActive ? "default" : "secondary"}>
                                        {template.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{template.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{template.downloads} downloads</span>
                                <span>{template.createdAt}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTemplateStatus(template.id)}
                                className="flex-1"
                            >
                                <Eye className="w-4 h-4 mr-1" />
                                {template.isActive ? "Hide" : "Show"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(template)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No templates found</p>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Template</DialogTitle>
                        <DialogDescription>
                            Update template information
                        </DialogDescription>
                    </DialogHeader>
                    <TemplateForm isEdit={true} />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false)
                                resetForm()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditTemplate}
                            disabled={!formData.title || !formData.imageUrl || !formData.category}
                        >
                            Update Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}