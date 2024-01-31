This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

PRs welcome!

Thanks for supporting MAGIC Monero Fund.

---

# Upgrading Server

ssh into the machine, and cd into the correct folder, under Production. Then:

`sudo git pull`

`sudo docker-compose up --build`

After building coompletes, quit out with Ctrl + C

`sudo docker start monerofund-frontend-page`
