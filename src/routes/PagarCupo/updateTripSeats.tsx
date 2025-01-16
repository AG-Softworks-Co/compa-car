// UpdateTripSeats.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

async function updateTripSeats(tripId: number, seatsToSubtract: number, token: string) {
    try {
        const tripResponse = await fetch(`https://rest-sorella-production.up.railway.app/api/trips/${tripId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token,
            },
            body: JSON.stringify({
                "seats": seatsToSubtract
            })
        });

        if (!tripResponse.ok) {
            const errorText = await tripResponse.text();
            console.error('Update Trip Response Error:', errorText);
            throw new Error(`HTTP error! status: ${tripResponse.status}`);
        }
        console.log('Response from /api/trips updated trip:', tripResponse);
        const tripDataResponse = await tripResponse.json();
        console.log('Response data from /api/trips updated trip:', tripDataResponse);

    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
}

const UpdateTripSeatsComponent = () => {
     const navigate = useNavigate();
     useEffect(() => {
       const searchParams = new URLSearchParams(window.location.search);
       const tripId = Number(searchParams.get('tripId'));
       const seatsToSubtract = Number(searchParams.get('seatsToSubtract'));
       const token = String(searchParams.get('token'));


       const updateSeats = async () => {
         try{
           if(tripId && seatsToSubtract && token){
             await updateTripSeats(tripId, seatsToSubtract, token);
            }
          } catch (error){
              console.error("Error updating the seats:", error)
           }
        };
         updateSeats();
   }, []);

    return null; // This component doesn't render anything
};


export const Route = createFileRoute('/PagarCupo/updateTripSeats')({
    component: UpdateTripSeatsComponent,
});