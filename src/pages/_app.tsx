import { Layout } from '@/layout/Layout';
import { store } from '@/store';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import '../../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
  // useLayoutEffect(() => {
  //   // @ts-ignore
  //   let mouse = new Mouse({
  //     mouse: 'cirle',
  //     color: '#000000',
  //     mouseHover: false,
  //     mousePointer: false,
  //     el: 'a',
  //     el_hover: true,
  //     mouse_clicked: true,
  //     clrChanged: false,
  //   });
  //   mouse.mouse();
  // }, []);
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}

export default MyApp;
