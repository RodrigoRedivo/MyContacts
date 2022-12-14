/* eslint-disable max-len */
import PropTypes from 'prop-types';
import {
  useState, useEffect, forwardRef, useImperativeHandle,
} from 'react';

import isEmailValid from '../../utils/isEmailValid';
import formatPhone from '../../utils/formatPhone';
import useErrors from '../../hooks/useErrors';
import CategoriesService from '../../service/CategoriesService';

import { ButtonContainer, Form } from './styles';

import { FormGroup } from '../FormGroup';
import Input from '../Input';
import Select from '../Select';
import { Button } from '../Button';

export const ContactForm = forwardRef(({ buttonLabel, onSubmit }, ref) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    errors, setError, removeError, getErrorMessageByFieldName,
  } = useErrors();

  const isFormValid = name && errors.length === 0;

  useImperativeHandle(ref, () => ({
    setFieldsValues: (contact) => {
      setName(contact.name ?? '');
      setEmail(contact.email ?? '');
      setPhone(formatPhone(contact.phone ?? ''));
      setCategoryId(contact.category.id ?? '');
    },
    resetFields: () => {
      setName('');
      setEmail('');
      setPhone('');
      setCategoryId('');
    },
  }), []);

  // useEffect(() => {
  //  const refObject = ref;
  //  refObject.current = {
  //    setFieldsValues: (contact) => {
  //      setName(contact.name);
  //      setEmail(contact.email);
  //      setPhone(contact.phone);
  //      setCategoryId(contact.categoryId);
  //    },
  //  };
  // }, [ref]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesList = await CategoriesService.listCategories();

        setCategories(categoriesList);
      } catch {
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  const handleNameChange = ({ target }) => {
    setName(target.value);

    if (!target.value) {
      setError({ field: 'name', message: 'Nome ?? obrigat??rio' });
    } else {
      removeError('name');
    }
  };

  const handleEmailChange = ({ target }) => {
    setEmail(target.value);

    if (target.value && !isEmailValid(target.value)) {
      setError({ field: 'email', message: 'E-mail inv??lido' });
    } else {
      removeError('email');
    }
  };

  const handlePhoneChange = ({ target }) => {
    setPhone(formatPhone(target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    await onSubmit({
      name,
      email,
      phone,
      categoryId,
    });

    setIsSubmitting(false);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} noValidate>
        <FormGroup error={getErrorMessageByFieldName('name')}>
          <Input
            error={getErrorMessageByFieldName('name')}
            placeholder="Nome *"
            value={name}
            onChange={handleNameChange}
            disabled={isSubmitting}
          />
        </FormGroup>

        <FormGroup error={getErrorMessageByFieldName('email')}>
          <Input
            type="email"
            error={getErrorMessageByFieldName('email')}
            placeholder="E-mail"
            value={email}
            onChange={handleEmailChange}
            disabled={isSubmitting}
          />
        </FormGroup>

        <FormGroup>
          <Input
            placeholder="Telefone"
            value={phone}
            onChange={handlePhoneChange}
            disabled={isSubmitting}
          />
        </FormGroup>

        <FormGroup isLoading={isLoadingCategories}>
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isLoadingCategories || isSubmitting}
          >
            <option value="">Sem categoria</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <ButtonContainer>
          <Button
            type="submit"
            disabled={!isFormValid}
            isLoading={isSubmitting}
          >
            {buttonLabel}
          </Button>
        </ButtonContainer>
      </Form>
    </>
  );
});

ContactForm.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
