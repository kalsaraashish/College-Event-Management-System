import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock3, Loader2, UserCheck } from 'lucide-react'
import { adminService } from '../../services/eventService'
import { PageHeader, TableSkeleton, EmptyState, Badge } from '../../components/UI'
import { formatDate } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function ApproveUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState(null)

  const loadPendingUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getPendingUsers()
      setUsers(res.data || [])
    } catch {
      toast.error('Failed to load pending users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPendingUsers() }, [loadPendingUsers])

  const handleApprove = async (userId) => {
    setApprovingId(userId)
    try {
      await adminService.approveUser(userId)
      toast.success('User approved')
      setUsers(list => list.filter(user => user.userId !== userId))
    } catch (err) {
      const data = err?.response?.data
      toast.error((typeof data === 'string' ? data : data?.message) || 'Approval failed')
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Approve Accounts"
        subtitle={`${users.length} accounts waiting for approval`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card flex items-center gap-3">
          <Clock3 size={20} className="text-amber-400" />
          <div>
            <p className="font-display font-bold text-xl text-white">{users.length}</p>
            <p className="text-xs text-gray-500">Pending Approvals</p>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton rows={5} cols={5} /> :
          users.length === 0 ? (
            <EmptyState icon={UserCheck} title="No pending users" message="All accounts are already reviewed." />
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.userId}>
                    <td className="font-medium text-white">{user.name}</td>
                    <td>{user.email}</td>
                    <td><Badge variant="default">{user.role}</Badge></td>
                    <td><Badge variant="warning">{user.status}</Badge></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleApprove(user.userId)}
                        disabled={approvingId === user.userId}
                        className="btn-primary flex items-center gap-2 py-2 px-3 text-xs"
                      >
                        {approvingId === user.userId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}