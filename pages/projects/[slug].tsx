import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { getPostBySlug, getAllPosts } from '../../utils/md'
import markdownToHtml from '../../utils/markdownToHtml'
import markdownStyles from "../../components/markdown-styles.module.css"
import Image from "next/image";
import ProjectList from '../../components/ProjectList'
import BackToProjects from '../../components/BackToProjects'
import { ProjectItem } from '../../utils/types'
import { NextPage } from 'next/types'

type SingleProjectPageProps = {
    project: ProjectItem;
    projects: ProjectItem[];
}

const Project: NextPage<SingleProjectPageProps> = ({ project, projects }) => {
    const router = useRouter()

    const { slug, title, summary, coverImage, git, twitter, content } = project;

    if (!router.isFallback && !slug) {
        return <ErrorPage statusCode={404} />
    }
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="h-[15rem] w-full relative">
                    <Image
                        alt={title}
                        src={coverImage}
                        layout="fill"
                        objectFit="cover"
                        objectPosition="50% 50%"
                        className="brightness-[.75]"
                    />

                </div>

                <div className="flex w-full p-4 py-8 md:px-8">
                    <BackToProjects />
                </div>
                <article className="px-4 md:px-8 pb-8 lg:flex lg:flex-row-reverse lg:items-start">
                    <aside className="p-4 bg-light rounded-xl flex lg:flex-col gap-4 min-w-[20rem] justify-between mb-8">
                        <div>

                            <h5>Raised</h5>
                            <h4>??? BTC</h4>
                        </div>
                        <button>Donate</button>

                    </aside>

                    <div className={markdownStyles['markdown']}>
                        <h1>{title}</h1>
                        <p>{summary}</p>

                        <p>by <a href={`https://github.com/${git}`}>{`@${git}`}</a></p>
                        <hr />
                        {content &&
                            <div
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        }
                    </div>
                </article>
            </div >
            <ProjectList projects={projects} header="You might also like..." />
        </>
    )
}

export default Project

export async function getStaticProps({ params }: { params: any }) {
    const post = getPostBySlug(params.slug, [
        'title',
        'summary',
        'slug',
        'git',
        'content',
        'coverImage',
    ])

    const projects = getAllPosts(['slug', 'title', 'summary', 'website', 'coverImage', 'git', 'twitter'])

    const content = await markdownToHtml(post.content || '')

    return {
        props: {
            project: {
                ...post,
                content,
            },
            projects
        },
    }
}

export async function getStaticPaths() {
    const posts = getAllPosts(['slug']);

    console.log(posts);

    return {
        paths: posts.map((post) => {
            return {
                params: {
                    project: post,
                    slug: post.slug,
                },
            }
        }),
        fallback: false,
    }
}
