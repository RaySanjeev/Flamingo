/* eslint-disable */
import axios from 'axios';
import showAlert from './alert';
const stripe = Stripe(
  'pk_test_51HnekJBr1cMCuPsjcBY6kgOKAP3dd9sBaat1oEJBmPHXAZJJPnrnPLdh9M5lGS1Gt1DGgImKRzUUPgITs3IJYIau005xc4zQvk'
);
export const booknow = async (tourID) => {
  try {
    const session = await axios(`/api/v1/booking/checkout-sessions/${tourID}`);
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('err', err);
  }
};
