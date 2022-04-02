import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { getPostBySlug, getAllPosts } from '../../utils/md'
import markdownToHtml from '../../utils/markdownToHtml'
import markdownStyles from "../../components/markdown-styles.module.css"
import waffledog from "../../public/waffledog.jpg";
import Image from "next/image";
import ProjectList from '../../components/ProjectList'
import BackToGrants from '../../components/BackToGrants'
import { ProjectItem } from '../../utils/types'

export default function Project({ post }: { post: ProjectItem }) {
    const router = useRouter()
    if (!router.isFallback && !post?.slug) {
        return <ErrorPage statusCode={404} />
    }
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="h-[15rem] w-full relative">
                    <Image
                        alt="waffledog"
                        src={waffledog}
                        layout="fill"
                        objectFit="cover"
                        objectPosition="50% 50%"
                        className="brightness-[.75]"
                    />

                </div>

                <div className="flex w-full p-4 py-8 md:px-8">
                    <BackToGrants />
                </div>
                <article className="px-4 md:px-8 pb-8 lg:flex lg:flex-row-reverse lg:items-start">
                    <aside className="p-4 bg-light rounded-xl flex lg:flex-col gap-4 min-w-[20rem] justify-between mb-8">
                        <div>

                            <h5>Raised</h5>
                            <h4>1.289 BTC</h4>
                        </div>
                        <button>Donate</button>

                    </aside>

                    <div className={markdownStyles['markdown']}>
                        <h1>{post.title}</h1>
                        <p>{post.summary}</p>
                        <p>by <a href={post.git.url}>{post.git.handle}</a></p>
                        <hr />
                        <div
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </article>
            </div>
            <ProjectList header="You might also like..." />
        </>
    )
}

export async function getStaticProps({ params }: { params: any }) {
    const post = getPostBySlug(params.slug, [
        'title',
        'summary',
        'slug',
        'git',
        'content',
        'coverImage',
    ])
    const content = await markdownToHtml(post.content || '')

    return {
        props: {
            post: {
                ...post,
                content,
            },
        },
    }
}

export async function getStaticPaths() {
    const posts = getAllPosts(['slug'])

    return {
        paths: posts.map((post) => {
            return {
                params: {
                    slug: post.slug,
                },
            }
        }),
        fallback: false,
    }
}