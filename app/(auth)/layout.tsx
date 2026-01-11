import React from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayoutProps = ({ children }: AuthLayoutProps) => {
    return (
        <div className='min-h-screen flex justify-center items-center bg-linear-to-r from-rose-100 to-teal-100'>
            {children}
        </div>
    )
}

export default AuthLayoutProps