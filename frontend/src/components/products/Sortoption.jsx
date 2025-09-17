import React from 'react';
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../redux/slices/productSlice';

function Sortoption() {
  const [searchparams, setsearchparams] = useSearchParams();
  const dispatch = useDispatch();
  const reduxFilters = useSelector(state => state.products.filters);

  const handlesortchange = (e) => {
    const sortBy = e.target.value;

    // Merge with existing filters
    const updatedFilters = {
      ...reduxFilters,
      sortBy,
    };

    // Update URL
    const params = new URLSearchParams(searchparams);
    if (sortBy) {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    setsearchparams(params);
    dispatch(setFilters(updatedFilters)); // ✅ Merged filters
  };

  return (
    <div className='mb-4 flex items-center justify-end'>
<select
  id="sort"
  onChange={handlesortchange}
  value={searchparams.get("sortBy") || ""}
  className='border p-2 rounded-md focus:outline-none'
>
  <option value="">Default</option>
  <option value="priceAsc">Price: Low to High</option>
  <option value="priceDesc">Price: High to Low</option>
  <option value="popularity">Popularity</option>
</select>

    </div>
  );
}

export default Sortoption;
