export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading XyloNet...</p>
      </div>
    </div>
  )
}
