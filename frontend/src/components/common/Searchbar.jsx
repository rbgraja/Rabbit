import React, { useState } from 'react';
import { HiMagnifyingGlass, HiMiniXMark } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom'; // ✅ add this

function Searchbar() {
  const [searchTerm, setsearchTerm] = useState('');
  const [Isopen, setIsopen] = useState(false);
  const navigate = useNavigate(); // ✅

  const handlesearchtoggle = () => {
    setIsopen(!Isopen);
  };

  const handlesearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/collection?keyword=${encodeURIComponent(searchTerm.trim())}`); // ✅ navigate to collection with search
    }

    setIsopen(false);
  };

  return (
    <div className={`flex items-center justify-center w-full transition-all duration-300 ${Isopen ? 'absolute top-0 left-0 w-full bg-white h-24 z-50' : 'w-auto'}`}>
      {Isopen ? (
        <form onSubmit={handlesearch} className='relative flex items-center justify-center w-full '>
          <div className='relative w-1/2'>
            <input
              type="text"
              placeholder='Search'
              value={searchTerm}
              onChange={(e) => setsearchTerm(e.target.value)}
              className='bg-gray-100 px-4 py-2 pl-12 pr-12 rounded-lg focus:outline-none w-full placeholder:text-gray-700'
            />
            <button type='submit' className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800'>
              <HiMagnifyingGlass className='h-6 w-6' />
            </button>
          </div>
          <button type='button' onClick={handlesearchtoggle} className='absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-600'>
            <HiMiniXMark className='h-6 w-6' />
          </button>
        </form>
      ) : (
        <button onClick={handlesearchtoggle}>
          <HiMagnifyingGlass className='h-6 w-6 ' />
        </button>
      )}
    </div>
  );
}

export default Searchbar;
