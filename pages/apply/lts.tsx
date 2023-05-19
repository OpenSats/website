import LTSApplicationForm from "@/components/LTSApplicationForm"

export default function Apply() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
      <h1 className="text-3xl font-bold">Apply to the LTS Program</h1>
      <LTSApplicationForm />
    </div>
  )
}
