import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock3, Loader2, UserCheck } from 'lucide-react'
import { adminService } from '../../services/eventService'
import { PageHeader, TableSkeleton, EmptyState, Badge } from '../../components/UI'
import { formatDate } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function PendingStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState(null)

  const loadPendingStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getPendingStudents()
      setStudents(res.data || [])
    } catch {
      toast.error('Failed to load pending students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPendingStudents() }, [loadPendingStudents])

  const handleApprove = async (userId) => {
    setApprovingId(userId)
    try {
      await adminService.approveStudent(userId)
      toast.success('Student approved')
      setStudents(list => list.filter(student => student.userId !== userId))
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
        title="Pending Students"
        subtitle={`${students.length} student accounts waiting for approval`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card flex items-center gap-3">
          <Clock3 size={20} className="text-amber-400" />
          <div>
            <p className="font-display font-bold text-xl text-white">{students.length}</p>
            <p className="text-xs text-gray-500">Pending Approvals</p>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton rows={5} cols={4} /> :
          students.length === 0 ? (
            <EmptyState icon={UserCheck} title="No pending students" message="All student accounts are already reviewed." />
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.userId}>
                    <td className="font-medium text-white">{student.name}</td>
                    <td>{student.email}</td>
                    <td><Badge variant="warning">{student.status}</Badge></td>
                    <td>{formatDate(student.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleApprove(student.userId)}
                        disabled={approvingId === student.userId}
                        className="btn-primary flex items-center gap-2 py-2 px-3 text-xs"
                      >
                        {approvingId === student.userId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
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