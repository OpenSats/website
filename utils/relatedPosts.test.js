/** @jest-environment node */
/* eslint-env jest, node */

const { getRelatedBlogPostsByTerms } = require('./relatedPosts.ts')

describe('related posts', () => {
  it('matches dotted project names across separator variants', () => {
    const posts = [
      {
        title: 'Third Wave of Nostr Grants',
        summary: '',
        tags: ['grants'],
        body: {
          raw: 'Funding zap.stream as a nostr-native live-streaming client.',
        },
      },
      {
        title: 'Unrelated',
        summary: '',
        tags: [],
        body: { raw: 'Funding zaps and streaming separately.' },
      },
    ]

    expect(getRelatedBlogPostsByTerms(['Zap.stream'], posts)).toEqual([
      posts[0],
    ])
  })
})
