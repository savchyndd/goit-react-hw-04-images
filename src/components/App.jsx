import { useState, useEffect } from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PostsApiService from 'services/PostApiService';

import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from 'components/Button/Button';
import { Loader } from 'components/Loader/Loader';

import { AppContent } from './App.module';

const postApiService = new PostsApiService();

export const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryPage, setGalleryPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [isButtonShow, setIsButtonShow] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!searchQuery) return;

    fetchGalleryItems(searchQuery, galleryPage);
  }, [searchQuery, galleryPage]);

  const fetchGalleryItems = (query, page) => {
    setLoading(true);
    setError(false);

    postApiService.query = query;
    postApiService.page = page;

    postApiService.fetchPost().then(data => {
      postApiService.hits = data.totalHits;

      const newData = data.hits.map(
        ({ id, tags, webformatURL, largeImageURL }) => ({
          id,
          tags,
          webformatURL,
          largeImageURL,
        })
      );
      const currentData = [...galleryItems, ...newData];

      setGalleryItems(prevGalleryItems => [...prevGalleryItems, ...newData]);

      if (!data.totalHits) {
        setLoading(false);
        setError(true);

        return toast.warn(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      if (currentData.length >= data.totalHits) {
        setLoading(false);
        setIsButtonShow(false);
        setError(false);

        return;
      }

      if (page === 1) {
        toast.success(`Hooray! We found ${postApiService.hits} images.`);
      }
      setLoading(false);
      setIsButtonShow(true);
      setError(false);
    });
  };

  const handleFormSubmit = searchQuery => {
    setSearchQuery('');
    setGalleryItems([]);
    setGalleryPage(1);

    setSearchQuery(searchQuery);
  };

  const onLoadMore = () => {
    setGalleryPage(prevGalleryPage => prevGalleryPage + 1);
  };

  return (
    <AppContent>
      <Searchbar onSubmit={handleFormSubmit} />

      {error && <h2>Please, enter search word!</h2>}
      {!error && <ImageGallery galleryItems={galleryItems} />}
      {loading && <Loader />}
      {isButtonShow && <Button onClick={onLoadMore} />}

      {/* Additions  */}
      <ToastContainer autoClose={3000} theme="dark" />
    </AppContent>
  );
};
