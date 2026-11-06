import { getAllTags } from './tags'

it('counts published tags using the existing GitHub-style URL slugs', () => {
  expect(
    getAllTags([
      { tags: ['Bitcoin Core', 'LTS'], draft: false },
      { tags: ['Bitcoin Core'], draft: false },
      { tags: ['Hidden'], draft: true },
      { tags: [], draft: false },
    ])
  ).toEqual({ 'bitcoin-core': 2, lts: 1 })
})
