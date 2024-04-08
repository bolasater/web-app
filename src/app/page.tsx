import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';

import { revalidatePath } from 'next/cache';
import * as mutations from '@/graphql/mutations';
import * as queries from '@/graphql/queries';

import config from '@/amplifyconfiguration.json';

const cookiesClient = generateServerClientUsingCookies({
  config,
  cookies
});

// 2. Create a new Server Action
async function createBlog(formData: FormData) {
  'use server';
  const { data } = await cookiesClient.graphql({
    query: mutations.createBlog,
    variables: {
      input: {
        name: formData.get('name')?.toString() ?? ''
      }
    }
  });

  console.log('Created Blog: ', data?.createBlog);

  revalidatePath('/');
}

export default async function Home() {
  const { data, errors } = await cookiesClient.graphql({
    query: queries.listBlogs
  });
  const blogs = data.listBlogs.items;
  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        marginTop: '100px'
      }}
    >
      <form action={createBlog}>
        <input name="name" placeholder="Add a blog" />
        <button type="submit">Add</button>
      </form>
      {(!blogs || blogs.length === 0 || errors) && (
        <div>
          <p>No blogs, please add one.</p>
        </div>
      )}

      <ul>
        {blogs.map((blog) => {
          return <li style={{ listStyle: 'none' }}>{blog.name}</li>;
        })}
      </ul>
    </div>
  );
}