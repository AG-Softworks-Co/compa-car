export interface Passenger {
    passenger_id: number;
    full_name: string;
    identification_number: string;
    booking_qr: string;
    payment_id: number;
}

export interface Booking {
    booking_id: number;
    trip_id: number;
    user_id: number;
    seats_booked: number;
    booking_date: string;
    total_price: number;
    booking_status: string;
    booking_message: string;
    main_text_origen?: string;
    main_text_destination?: string;
    date_time?: string;
    passengers?: Passenger[];
}
