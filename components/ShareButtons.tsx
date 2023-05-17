import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { ProjectItem } from "../utils/types"

const ShareButtons: React.FC<{ project: ProjectItem }> = ({ project }) => {
    const { git, twitter, website } = project;
    return (
        <div className="flex space-x-4">
            <Link href={git} passHref>
                <a>
                    <FontAwesomeIcon
                        icon={faGithub}
                        className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
                    />
                </a>
            </Link>
            <Link href={`https://twitter.com/${twitter}`} passHref>
                <a>
                    <FontAwesomeIcon
                        icon={faTwitter}
                        className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
                    />
                </a>
            </Link>
            {website && <Link href={website} passHref>
                <a>
                    <FontAwesomeIcon
                        icon={faLink}
                        className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
                    />
                </a>
            </Link>}
        </div>
    )
}



export default ShareButtons