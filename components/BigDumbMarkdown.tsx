export default function BigDumbMarkdown({ content }: { content: string }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="prose max-w-[60ch] px-4 leading-relaxed lg:px-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  )
}
