"use client";

import { Input } from "antd";
import { MagnifyingGlass } from "@phosphor-icons/react";

const Search = () => {
    return (
        <>
            <div className="search">
                <Input
                    id="search"
                    name="search"
                    placeholder="Search..."
                    prefix={<MagnifyingGlass size={22} />}
                    size="large"
                    className="search__input"
                />
            </div>
        </>
    );
}

export default Search;