import RequestQuotePage from '@/features/request-quote/components/RequestQuoteForm'
import React from 'react'

const RequestQuote = () => {
    return (
        <div className='container mx-auto px-4'>
            <h1 className="text-2xl font-bold text-center mb-8 p-6">Request a Quote</h1>
            <RequestQuotePage />
        </div>
    )
}

export default RequestQuote