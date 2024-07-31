import { SaveOutlined } from '@mui/icons-material'
import { Box, MenuItem } from '@mui/material'
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import BasicButton from '../../shared/Basic/BasicButton'
import BasicInput from '../../shared/Basic/BasicInput'
import BasicSelect from '../../shared/Basic/BasicSelect'
import { Colors } from '../../styles/colors'

const UserForm = ({
  setOpen,
  setRefresh,
  element = {},
  setIsEditing,
  //setElement,
  isEditing,
  //query,
  format,
}) => {
  const [newElement, setNewElement] = useState(element)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUserType, setIsLoadingUserType] = useState(false)
  const [userTypeList, setUserTypeList] = useState([])
  const [isValidCedula, setIsValidCedula] = useState('')

  // Handle the button disabled state based on the new element state
  const isButtonDisabled =
    Object.values(newElement)?.some((value) => !value) ||
    Object.values(newElement)?.some((value) => !value.toString().trim()) ||
    !Object.values(newElement)?.length

  // Handle the input change
  const handleInputChange = (event) => {
    const { name, value } = event.target

    // Evitar números negativos para "Limite de credito"
    if (name === 'creditLimit' && (value < 0 || value === '-')) {
      if (value === '-') {
        setNewElement((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      } else {
        setNewElement((prevState) => ({
          ...prevState,
          [name]: '',
        }));
      }
      return;
    }

    setNewElement((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Prevent negative values in the credit limit field
  const handleKeyPress = (event) => {
    if (event.key === '-' && event.target.name === 'creditLimit') {
      if (event.target.value.length > 0) {
        event.preventDefault();
      }
    }
  }

  // Handle the form submit
  const onSubmit = async () => {
    const isValid = validaCedula(newElement?.cedula || '')
    console.log(isValid)
    setIsValidCedula(isValid)
    if (!isValid) return
    isEditing ? update() : create()
  }

  function validaCedula(pCedula) {
    console.log(pCedula)
    let vnTotal = 0
    let vcCedula = pCedula.replace(/-/g, '')
    let pLongCed = vcCedula.trim().length
    let digitoMult = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]

    if (pLongCed !== 11 ) {
      return false
    }

    for (let vDig = 1; vDig <= pLongCed; vDig++) {
      let vCalculo =
        parseInt(vcCedula.substring(vDig - 1, vDig)) * digitoMult[vDig - 1]
      if (vCalculo < 10) {
        vnTotal += vCalculo
      } else {
        let vCalArr = vCalculo.toString().split('')
        vnTotal += Number(vCalArr[0]) + Number(vCalArr[1])
      }
    }

    return vnTotal % 10 === 0
  }

  const create = async () => {
    try {
      await axios.post(
        'https://cafeteria-op-src-api.onrender.com/api/users',
        newElement
      )
      setRefresh((prevVal) => !prevVal)
      setOpen(false)
    } catch (error) {
      console.log(error)
    } finally {
      setIsEditing(false)
      setIsLoading(false)
    }
  }

  const update = async () => {
    try {
      await axios.put(
        `https://cafeteria-op-src-api.onrender.com/api/users/${newElement.id}`,
        newElement
      )
      setRefresh((prevVal) => !prevVal)
      setOpen(false)
    } catch (error) {
      console.log(error)
    } finally {
      setIsEditing(false)
      setIsLoading(false)
    }
  }

  const getUserTypes = async () => {
    setIsLoadingUserType(true)
    try {
      const res = await axios.get(
        'https://cafeteria-op-src-api.onrender.com/api/user-types'
      )
      setUserTypeList(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingUserType(false)
    }
  }

  useEffect(() => {
    getUserTypes()
  }, [])

  return (
    <Box>
      <BasicInput
        label={'Nombre'}
        required
        name="name"
        //disabled={query === 'exchangeRate'}
        defaultValue={element?.name || ''}
        onChange={handleInputChange}
      />
      <BasicInput
        label={'Cedula'}
        required
        name="cedula"
        //disabled={query === 'exchangeRate'}
        defaultValue={element?.cedula || ''}
        onChange={handleInputChange}
      />
      {isValidCedula === false && <p>Cedula Invalida</p>}

      <BasicInput
        label={'Limite de credito'}
        type="number"
        required
        name="creditLimit"
        //disabled={query === 'exchangeRate'}
        defaultValue={element?.creditLimit || ''}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        min="0" // Añadido para evitar números negativos
      />
      <BasicSelect
        name="userTypeId"
        label={'Tipo de Usuario'}
        defaultValue={newElement?.userTypeId || ''}
        onChange={handleInputChange}
        isLoading={isLoadingUserType}
        // formRegister={{
        //   ...register('warehouseId', { required: true }),
        // }}
        //style={{ maxWidth: isClosed ? '100%' : '57%' }}
      >
        {userTypeList?.map((data) => (
          <MenuItem key={data.id} value={data.id}>
            {data.description}
          </MenuItem>
        ))}
      </BasicSelect>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <BasicButton
          type="submit"
          endIcon={<SaveOutlined />}
          style={{ color: Colors.white }}
          disabled={isButtonDisabled || isLoading}
          isLoading={isLoading}
          onClick={() => onSubmit(newElement)}
        >
          {'GUARDAR'}
        </BasicButton>
      </Box>
    </Box>
  )
}

export default UserForm
