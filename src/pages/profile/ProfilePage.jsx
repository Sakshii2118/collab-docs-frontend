import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Avatar } from '../../components/common/Avatar'
import { handleAPIError } from '../../utils/errorHandler'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const navigate = useNavigate()
    const { user, setUser } = useAuthStore()
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
    })
    const [passwords, setPasswords] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    const handleProfileSave = async (e) => {
        e.preventDefault()
        setIsSavingProfile(true)
        try {
            const { data } = await authService.updateProfile(formData)
            setUser(data)
            toast.success('Profile updated!')
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handlePasswordSave = async (e) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords don't match")
            return
        }
        setIsSavingPassword(true)
        try {
            await authService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            })
            toast.success('Password changed!')
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            handleAPIError(err)
        } finally {
            setIsSavingPassword(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Profile Settings</h1>
            </header>

            <main className="max-w-xl mx-auto py-8 px-4 space-y-6">
                {/* Profile info */}
                <section className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar user={user} size="lg" />
                        <div>
                            <div className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                    </div>

                    <h2 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h2>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <Input label="Email" value={user?.email} disabled />
                        <Button type="submit" loading={isSavingProfile}>Save Changes</Button>
                    </form>
                </section>

                {/* Change password */}
                <section className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordSave} className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            error={passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? "Passwords don't match" : undefined}
                            required
                        />
                        <Button type="submit" loading={isSavingPassword}>Update Password</Button>
                    </form>
                </section>
            </main>
        </div>
    )
}
