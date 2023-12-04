import Loading from '@/component/Loading';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';

const theme = extendTheme({
  fonts: {
    heading: `'Jua', sans-serif`,
    body: `'Jua', sans-serif`,
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <RecoilRoot>
        <Suspense fallback={<Loading />}>
          <Component {...pageProps} />
        </Suspense>
      </RecoilRoot>
    </ChakraProvider>
  );
}

export default MyApp;
