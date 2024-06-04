import xss from 'xss'
import markdownStyles from './markdown-styles.module.css'

export default function BigDumbMarkdown({ content }: { content: string }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className={markdownStyles['markdown']}>
        <div dangerouslySetInnerHTML={{ __html: xss(content) }} />
      </div>
    </div>
  )
}
