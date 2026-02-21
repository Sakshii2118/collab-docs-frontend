import { useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { Avatar, AvatarGroup } from '../common/Avatar'
import axios from 'axios'
import { YJS_API_URL } from '../../utils/constants'

export function ActiveUsersList({ yjsRoomId }) {
    const { activeUsers, setActiveUsers } = useEditorStore()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(
                    `${YJS_API_URL}/api/documents/${yjsRoomId}/users`
                )
                setActiveUsers(data.users || [])
            } catch (_) {
                // Silently ignore - YJS service may not expose this
            }
        }

        fetchUsers()
        const interval = setInterval(fetchUsers, 10_000)
        return () => clearInterval(interval)
    }, [yjsRoomId])

    if (activeUsers.length === 0) return null

    return (
        <div className="flex items-center gap-2">
            <AvatarGroup
                users={activeUsers.map(u => ({ id: u.userId, firstName: u.name.split(' ')[0], lastName: u.name.split(' ').slice(1).join(' ') }))}
                max={5}
                size="sm"
            />
            {activeUsers.length > 0 && (
                <span className="text-xs text-gray-500 hidden sm:inline">
                    {activeUsers.length} online
                </span>
            )}
        </div>
    )
}
